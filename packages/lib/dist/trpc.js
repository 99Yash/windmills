import { initTRPC, TRPCError } from '@trpc/server';
// Initialise tRPC factory bound to a lightweight context shared by all apps
export const t = initTRPC.context().create();
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
