import { tryPromise } from "../../../../common/result";
import { KnowledgeIngestor } from "../ingestion/knowledge.ingestor";
import { KnowledgeRetriever } from "../retrieval/knowledge.retriever";

import type { KnowledgeFacade } from "../../api";
import type { KnowledgeVectorStoreManager } from "../infrastructure/knowledge-vector-store.manager";

export function createKnowledgeFacade(deps: {
  readonly vectorStoreManager: KnowledgeVectorStoreManager;
}): KnowledgeFacade {
  const ingestor = new KnowledgeIngestor({
    vectorStoreManager: deps.vectorStoreManager,
  });
  const retriever = new KnowledgeRetriever({
    vectorStoreManager: deps.vectorStoreManager,
  });

  return {
    ingest: (params) => ingestor.ingest(params),
    retrieve: (params) => retriever.retrieve(params),
    retrieveRange: (params) => retriever.retrieveRange(params),
    countChunks: (params) => retriever.countChunks(params),
    getChunkStats: (params) => retriever.getChunkStats(params),
    deleteByRef: (params) =>
      tryPromise(async () => {
        const store = await deps.vectorStoreManager.getStoreForUser({
          userId: params.userId,
        });
        await store.delete({
          filter: {
            userId: params.userId,
            type: params.type,
            refId: params.refId,
          },
        });
      }),
  };
}
