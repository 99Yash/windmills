import { initTRPC, TRPCError } from '@trpc/server';

export interface BaseContext {
  /** Populated by the server’s auth middleware */
  session?: {
    user?: unknown;
    // eslint-disable-next-line @typescript-eslint/ban-types
    [k: string]: unknown;
  } | null;
}

// Initialise tRPC factory bound to a lightweight context shared by all apps
export const t = initTRPC.context<BaseContext>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication required',
    });
  }
  return next({
    ctx: {
      ...ctx,
      // At this point we know session is defined
      session: ctx.session,
    },
  });
});

export type Context = BaseContext;
