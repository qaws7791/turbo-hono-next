import { OpenAPIHono } from "@hono/zod-openapi";
import { container } from "../../../container/bindings";
import { TYPES } from "../../../container/types";
import { IProjectService } from "../domain/project.service";
import {
  createProjectRoute,
  deleteProjectRoute,
  getMyProjectsRoute,
  getProjectRoute,
  getProjectsRoute,
  updateProjectRoute,
} from "./projects.routes";

const app = new OpenAPIHono();

app.openapi(createProjectRoute, async (c) => {
  const user = c.get("auth");
  const data = c.req.valid("json");

  const projectService = container.get<IProjectService>(TYPES.ProjectService);
  const project = await projectService.createProject(user.userId, data);

  return c.json(project, 201);
});

app.openapi(getProjectsRoute, async (c) => {
  const query = c.req.valid("query");
  const user = c.get("auth");

  const params = {
    cursor: query.cursor,
    limit: Number(query.limit),
    filters: {
      sort: query.sort,
      region: query.region,
      category: query.category,
      search: query.search,
      status: "published" as const,
    },
  };

  const projectService = container.get<IProjectService>(TYPES.ProjectService);
  const result = await projectService.getProjects(params, user?.userId);

  return c.json(result);
});

app.openapi(getProjectRoute, async (c) => {
  const { id } = c.req.valid("param");
  const user = c.get("auth");

  const projectService = container.get<IProjectService>(TYPES.ProjectService);
  const project = await projectService.getProject(id, user?.userId);

  return c.json(project);
});

app.openapi(updateProjectRoute, async (c) => {
  const { id } = c.req.valid("param");
  const data = c.req.valid("json");
  const user = c.get("auth");

  const projectService = container.get<IProjectService>(TYPES.ProjectService);
  const project = await projectService.updateProject(id, user.userId, data);

  return c.json(project);
});

app.openapi(deleteProjectRoute, async (c) => {
  const { id } = c.req.valid("param");
  const user = c.get("auth");

  const projectService = container.get<IProjectService>(TYPES.ProjectService);
  await projectService.deleteProject(id, user.userId);

  return c.body(null, 204);
});

app.openapi(getMyProjectsRoute, async (c) => {
  const query = c.req.valid("query");
  const user = c.get("auth");

  const params = {
    cursor: query.cursor,
    limit: Number(query.limit),
    filters: {
      status: query.status,
      sort: query.sort,
      region: query.region,
      category: query.category,
      search: query.search,
    },
  };

  const projectService = container.get<IProjectService>(TYPES.ProjectService);
  const result = await projectService.getUserProjects(
    user.userId,
    user.userId,
    params,
  );

  return c.json(result);
});
