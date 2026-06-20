export type TinaNode = {
  type: string;
  text?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  children?: TinaNode[];
  url?: string;
  alt?: string;
  value?: string;
};

export type TinaRichTextContent =
  | TinaNode
  | TinaNode[]
  | {
      type: 'root';
      children?: TinaNode[];
    };

/** Hoisted prose classes — avoid recreating strings in templates (rendering-hoist-jsx). */
export const MISSION_PROSE_CLASS =
  'prose prose-base max-w-none prose-h3:font-sans prose-h3:not-italic prose-h3:text-xl prose-h3:font-bold prose-h3:text-[--ootb-turquoise] prose-h3:mt-8 prose-h3:mb-2 prose-h4:font-sans prose-h4:not-italic prose-h4:text-base prose-h4:font-semibold prose-h4:text-gray-800 prose-h4:mt-5 prose-h4:mb-1 prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-gray-900';

export const VALEUR_PROSE_CLASS = 'prose prose-sm max-w-none text-gray-700';

export const CATEGORY_PROSE_CLASS = 'prose prose-sm max-w-none text-gray-700';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderLeaf(node: TinaNode): string {
  let text = escapeHtml(node.text ?? '');

  if (node.code) text = `<code>${text}</code>`;
  if (node.bold) text = `<strong>${text}</strong>`;
  if (node.italic) text = `<em>${text}</em>`;
  if (node.underline) text = `<u>${text}</u>`;
  if (node.strikethrough) text = `<s>${text}</s>`;

  return text;
}

function renderNodes(nodes: TinaNode[] | undefined): string {
  if (!nodes?.length) return '';
  return nodes.map(renderNode).join('');
}

function renderBlockTag(tag: string, children: TinaNode[] | undefined): string {
  return `<${tag}>${renderNodes(children)}</${tag}>`;
}

function renderNode(node: TinaNode): string {
  switch (node.type) {
    case 'text':
      return renderLeaf(node);
    case 'lic':
      return renderNodes(node.children);
    case 'p':
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
    case 'ul':
    case 'ol':
    case 'li':
    case 'blockquote':
      return renderBlockTag(node.type, node.children);
    case 'a':
      return `<a href="${escapeHtml(node.url ?? '#')}">${renderNodes(node.children)}</a>`;
    case 'img':
      return `<img src="${escapeHtml(node.url ?? '')}" alt="${escapeHtml(node.alt ?? '')}" />`;
    case 'hr':
      return '<hr />';
    case 'break':
      return '<br />';
    case 'code_block':
      return `<pre><code>${escapeHtml(node.value ?? renderNodes(node.children))}</code></pre>`;
    default:
      return renderNodes(node.children);
  }
}

/** Build-time HTML for Tina rich text — keeps tinacms React off static Astro pages (bundle-defer-third-party). */
export function richTextToHtml(content: TinaRichTextContent | string | null | undefined): string {
  if (!content) return '';
  if (typeof content === 'string') return content;

  const nodes = Array.isArray(content) ? content : content.children;
  if (!nodes?.length) return '';

  return renderNodes(nodes);
}

export function isTinaRichText(content: unknown): content is TinaRichTextContent {
  return typeof content === 'object' && content !== null && !Array.isArray(content) && 'type' in content;
}
