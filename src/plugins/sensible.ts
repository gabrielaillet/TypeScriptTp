import fp from 'fastify-plugin'
import level, { FastifyLeveldbOptions } from '@fastify/leveldb'

export default fp<FastifyLeveldbOptions>(async (fastify) => {
  fastify.register(level, { name: 'db', path: './db' })
})