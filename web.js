import { Airgram } from '@airgram/web'
import { Auth } from 'airgram' // We borrow the component only for demonstration purposes.
import 'dotenv/config';

const airgram = new Airgram({
    apiId: process.env.APP_ID,
    apiHash: process.env.APP_HASH
})

airgram.use(new Auth({
  code: () => window.prompt('Please enter the secret code:') || '',
  phoneNumber: () => window.prompt('Please enter your phone number:') || '',
  password: () => window.prompt('Please enter your password:') || ''
}))

airgram.use(async (ctx, next) => {
  if ('request' in ctx) {
    console.log('🚀 [Airgram Request]:', ctx.request)
  } else if (ctx.update) {
    console.log('🚀 [Airgram Update]:', ctx.update)
  }
  await next()
  if ('request' in ctx) {
    console.log('🚀 [Airgram Response]:', ctx.request.method, ctx.response)
  }
})