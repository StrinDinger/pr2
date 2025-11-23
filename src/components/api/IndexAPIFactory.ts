import { BaseIndexAPI } from './indexes/BaseIndexAPI';
import { MoexIndexAPI } from './indexes/MoexIndexAPI';
import { IndexType } from './types';

export class IndexAPIFactory {
  private static instances: Map<IndexType, BaseIndexAPI> = new Map();

  static getAPI(indexType: IndexType, apiKey?: string): BaseIndexAPI {
    if (!this.instances.has(indexType)) {
      let instance: BaseIndexAPI;

      switch (indexType) {
        case IndexType.MOEX:
          instance = new MoexIndexAPI();
          break;
        default:
          throw new Error(`Unsupported index type: ${indexType}`);
      }

      this.instances.set(indexType, instance);
    }

    return this.instances.get(indexType)!;
  }

  static getAvailableIndexes(): IndexType[] {
    return Object.values(IndexType);
  }

  static async healthCheckAll(): Promise<Record<IndexType, boolean>> {
    const results: Record<IndexType, boolean> = {} as Record<IndexType, boolean>;
    
    for (const [indexType, api] of this.instances) {
      results[indexType] = await api.healthCheck();
    }

    return results;
  }
}
export { IndexType } from './types';