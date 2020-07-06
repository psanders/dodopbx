import path from 'path'
import logger from '@fonos/logger'
import grpc from 'grpc'
import createAccessFile, { accessExist } from '@fonos/certs'
import StorageServer, {
  IStorageServer,
  StorageService
} from './storage/storage'
import AppManagerServer, { AppManagerService } from './appmanager/appmanager'
import { IAppManagerServer } from './protos/appmanager_grpc_pb'
import { INumbersServer } from './protos/numbers_grpc_pb'
import { IAgentsServer, AgentsService } from './protos/agents_grpc_pb'
import { IDomainsServer, DomainsService } from './protos/domains_grpc_pb'
import { IProvidersServer, ProvidersService } from './protos/providers_grpc_pb'
import NumbersServer, { NumbersService } from './numbers/numbers'
import AgentsServer from './agents/agents'
import DomainsServer from './domains/domains'
import ProvidersServer from './providers/providers'

if (!process.env.NODE_ENV || process.env.NODE_ENV === 'dev') {
  const env = path.join(__dirname, '..', '..', '..', '..', '.env')
  require('dotenv').config({ path: env })
}

async function main () {
  if (!accessExist()) {
    logger.log('info', `No access file found. Creating access file`)
    await createAccessFile()
  }

  const server = new grpc.Server()
  const endpoint = process.env.BINDADDR || '0.0.0.0:50052'
  server.addService<IProvidersServer>(ProvidersService, new ProvidersServer())
  server.addService<IDomainsServer>(DomainsService, new DomainsServer())
  server.addService<IAgentsServer>(AgentsService, new AgentsServer())
  server.addService<INumbersServer>(NumbersService, new NumbersServer())
  server.addService<IStorageServer>(StorageService, new StorageServer())
  server.addService<IAppManagerServer>(
    AppManagerService,
    new AppManagerServer()
  )
  server.bind(endpoint, grpc.ServerCredentials.createInsecure())
  server.start()

  logger.log(
    'info',
    `Fonos APIServer is online @ ${endpoint} (API version = v1alpha1)`
  )
}

main()