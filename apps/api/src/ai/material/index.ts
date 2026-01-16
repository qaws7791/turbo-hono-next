import { MaterialAnalyzer } from "./analyze";

export type {
  AnalyzeMaterialParams,
  AnalyzeMaterialResult,
  MaterialOutlineNode,
} from "./analyze";
export { MaterialAnalyzer };

export const materialAnalyzer = new MaterialAnalyzer();
