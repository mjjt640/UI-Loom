import { z } from 'zod'

const spacingSchema = z.object({
  top: z.number(),
  right: z.number(),
  bottom: z.number(),
  left: z.number(),
})

const constraintsSchema = z.object({
  horizontal: z.enum(['left', 'center', 'right', 'stretch']).optional(),
  vertical: z.enum(['top', 'center', 'bottom', 'stretch']).optional(),
})

const pointSchema = z.object({
  x: z.number(),
  y: z.number(),
})

const pathNodePointSchema = z.object({
  anchor: pointSchema,
  inHandle: pointSchema.optional(),
  outHandle: pointSchema.optional(),
})

export const nodeSchema = z.object({
  id: z.string(),
  type: z.enum([
    'page',
    'frame',
    'group',
    'container',
    'rect',
    'ellipse',
    'triangle',
    'star',
    'polygon',
    'path',
    'slice',
    'icon',
    'text',
    'image',
    'button',
    'input',
    'list',
    'card',
  ]),
  name: z.string(),
  parentId: z.string().nullable(),
  children: z.array(z.string()),
  layout: z.object({
    mode: z.enum(['absolute', 'flex-row', 'flex-column']),
    x: z.number().optional(),
    y: z.number().optional(),
    width: z.union([z.number(), z.literal('hug'), z.literal('fill')]),
    height: z.union([z.number(), z.literal('hug'), z.literal('fill')]),
    minWidth: z.number().optional(),
    maxWidth: z.number().optional(),
    minHeight: z.number().optional(),
    maxHeight: z.number().optional(),
    gap: z.number().optional(),
    padding: spacingSchema.optional(),
    align: z.enum(['start', 'center', 'end', 'stretch']).optional(),
    justify: z.enum(['start', 'center', 'end', 'between']).optional(),
    constraints: constraintsSchema.optional(),
  }),
  style: z.object({
    background: z.string().optional(),
    color: z.string().optional(),
    radius: z.number().optional(),
    borderWidth: z.number().optional(),
    borderColor: z.string().optional(),
    fontSize: z.number().optional(),
    fontWeight: z.number().optional(),
    shadow: z.string().optional(),
    opacity: z.number().optional(),
  }),
  content: z.object({
    text: z.string().optional(),
    src: z.string().optional(),
    alt: z.string().optional(),
    placeholder: z.string().optional(),
    pathData: z.string().optional(),
    pathNodes: z.array(pathNodePointSchema).optional(),
    svgPath: z.string().optional(),
    viewBox: z.string().optional(),
  }),
  meta: z.object({
    locked: z.boolean().optional(),
    visible: z.boolean().optional(),
    componentHint: z.string().optional(),
  }),
})

export const pageDocumentSchema = z.object({
  version: z.literal(1),
  projectId: z.string(),
  pageId: z.string(),
  name: z.string(),
  rootNodeId: z.string(),
  nodes: z.record(z.string(), nodeSchema),
  selectedNodeIds: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
})
