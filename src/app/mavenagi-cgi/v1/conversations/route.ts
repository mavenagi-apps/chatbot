// @ts-nocheck
import {conversationCreatedOrUpdated} from '../../next'
import userWorker from '../../../..'

export const POST = conversationCreatedOrUpdated
export const runtime = 'nodejs'
export const maxDuration = 900
