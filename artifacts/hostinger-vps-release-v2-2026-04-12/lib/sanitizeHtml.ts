import sanitizeHtml, { type IOptions } from 'sanitize-html'

const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'em',
  'u',
  's',
  'blockquote',
  'ul',
  'ol',
  'li',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'a',
  'img',
]

const ALLOWED_ATTRIBUTES: IOptions['allowedAttributes'] = {
  p: ['data-lead'],
  a: ['href', 'name', 'target', 'rel'],
  img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const looksLikeHtml = (value: string) => /<\/?[a-z][\s\S]*>/i.test(value)

const formatInlineText = (value: string) => {
  let formatted = escapeHtml(value)

  formatted = formatted.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2">$1</a>'
  )
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  formatted = formatted.replace(/__([^_]+)__/g, '<u>$1</u>')
  formatted = formatted.replace(/~~([^~]+)~~/g, '<s>$1</s>')
  formatted = formatted.replace(
    /(^|[\s(>])\*([^*\n][^*\n]*?)\*(?=[$\s).,!?:;])/g,
    '$1<em>$2</em>'
  )
  formatted = formatted.replace(
    /(^|[\s(>])_([^_\n][^_\n]*?)_(?=[$\s).,!?:;])/g,
    '$1<em>$2</em>'
  )

  return formatted
}

const stripHtml = (value: string) => value.replace(/<[^>]+>/g, '').trim()

const isLeadParagraphText = (value: string) => {
  const normalized = value.replace(/\s+/g, ' ').trim()
  if (!normalized) return false
  if (normalized.length < 45 || normalized.length > 220) return false
  if (/[#:|]/.test(normalized)) return false
  if (/^(catatan|note|notes?)\s*:/i.test(normalized)) return false
  if (/^(https?:\/\/|www\.)/i.test(normalized)) return false
  return true
}

const markLeadParagraph = (html: string) => {
  let leadAssigned = false

  return html.replace(/<p([^>]*)>([\s\S]*?)<\/p>/gi, (match, attributes, content) => {
    if (leadAssigned) return match

    const plainText = stripHtml(content)
    if (!isLeadParagraphText(plainText)) return match

    leadAssigned = true
    const trimmedAttributes = typeof attributes === 'string' ? attributes.trim() : ''
    const safeAttributes = trimmedAttributes ? ` ${trimmedAttributes}` : ''

    return `<p${safeAttributes} data-lead="true">${content}</p>`
  })
}

const normalizePlainTextToHtml = (value: string) => {
  const normalized = value.replace(/\r\n/g, '\n').trim()
  if (!normalized) return '<p>No content available.</p>'

  const lines = normalized.split('\n')
  const htmlBlocks: string[] = []
  let unorderedItems: string[] = []
  let orderedItems: string[] = []
  let quoteLines: string[] = []

  const flushListsAndQuotes = () => {
    if (unorderedItems.length) {
      htmlBlocks.push(`<ul>${unorderedItems.join('')}</ul>`)
      unorderedItems = []
    }

    if (orderedItems.length) {
      htmlBlocks.push(`<ol>${orderedItems.join('')}</ol>`)
      orderedItems = []
    }

    if (quoteLines.length) {
      htmlBlocks.push(`<blockquote>${quoteLines.join('<br />')}</blockquote>`)
      quoteLines = []
    }
  }

  const isHeadingLine = (line: string) => {
    if (/^#{1,6}\s+/.test(line)) return true
    if (/^\d+\.\s+.+/.test(line) && /[:?]$/.test(line)) return true
    if (/^[A-ZÀ-ÿ0-9][^.!?]{0,120}:\s?.+$/.test(line)) return true
    return false
  }

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim()
    const nextLine = lines[index + 1]?.trim() || ''

    if (!line) {
      flushListsAndQuotes()
      return
    }

    if (/^>\s?/.test(line)) {
      if (unorderedItems.length || orderedItems.length) flushListsAndQuotes()
      quoteLines.push(formatInlineText(line.replace(/^>\s?/, '')))
      return
    }

    if (/^[-*•]\s+/.test(line)) {
      if (orderedItems.length || quoteLines.length) flushListsAndQuotes()
      unorderedItems.push(`<li>${formatInlineText(line.replace(/^[-*•]\s+/, ''))}</li>`)
      return
    }

    if (/^\d+\)\s+/.test(line)) {
      if (unorderedItems.length || quoteLines.length) flushListsAndQuotes()
      orderedItems.push(`<li>${formatInlineText(line.replace(/^\d+\)\s+/, ''))}</li>`)
      return
    }

    if (/^\d+\.\s+/.test(line) && !isHeadingLine(line) && /^\d+\.\s+/.test(nextLine)) {
      if (unorderedItems.length || quoteLines.length) flushListsAndQuotes()
      orderedItems.push(`<li>${formatInlineText(line.replace(/^\d+\.\s+/, ''))}</li>`)
      return
    }

    flushListsAndQuotes()

    if (/^#{1,6}\s+/.test(line)) {
      const headingLevel = Math.min(line.match(/^#+/)?.[0]?.length || 2, 6)
      htmlBlocks.push(
        `<h${headingLevel}>${formatInlineText(line.replace(/^#{1,6}\s+/, ''))}</h${headingLevel}>`
      )
      return
    }

    if (isHeadingLine(line)) {
      htmlBlocks.push(`<h2>${formatInlineText(line)}</h2>`)
      return
    }

    htmlBlocks.push(`<p>${formatInlineText(line)}</p>`)
  })

  flushListsAndQuotes()

  if (!htmlBlocks.length) return '<p>No content available.</p>'
  return htmlBlocks.join('')
}

export function sanitizeRichText(html: string | null | undefined) {
  if (!html) return '<p>No content available.</p>'
  const preparedHtml = looksLikeHtml(html) ? html : normalizePlainTextToHtml(html)
  const htmlWithLead = markLeadParagraph(preparedHtml)

  return sanitizeHtml(htmlWithLead, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: {
      img: ['http', 'https'],
    },
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          href: attribs.href || '#',
          target: attribs.target === '_blank' ? '_blank' : '_self',
          rel: 'noopener noreferrer nofollow',
        },
      }),
      img: (tagName, attribs) => ({
        tagName,
        attribs: {
          src: attribs.src || '',
          alt: attribs.alt || '',
          title: attribs.title || '',
          loading: 'lazy',
        },
      }),
    },
  })
}
