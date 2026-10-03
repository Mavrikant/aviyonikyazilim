/** Geçici iskelet — gerçek uygulama ayrı bir iş paketinde yazılır. */
import type {Plugin} from '@docusaurus/types';

export default function llmsTxt(): Plugin {
  return {name: 'llms-txt'};
}
