export interface BaseContext {
    /** Populated by the server’s auth middleware */
    session?: {
        user?: unknown;
        [k: string]: unknown;
    } | null;
}
export declare const t: import("@trpc/server").TRPCRootObject<BaseContext, object, import("@trpc/server").TRPCRuntimeConfigOptions<BaseContext, object>, {
    ctx: BaseContext;
    meta: object;
    errorShape: import("@trpc/server").TRPCDefaultErrorShape;
    transformer: false;
}>;
export declare const router: import("@trpc/server").TRPCRouterBuilder<{
    ctx: BaseContext;
    meta: object;
    errorShape: import("@trpc/server").TRPCDefaultErrorShape;
    transformer: false;
}>;
export declare const publicProcedure: import("@trpc/server").TRPCProcedureBuilder<BaseContext, object, object, import("@trpc/server").TRPCUnsetMarker, import("@trpc/server").TRPCUnsetMarker, import("@trpc/server").TRPCUnsetMarker, import("@trpc/server").TRPCUnsetMarker, false>;
export declare const protectedProcedure: import("@trpc/server").TRPCProcedureBuilder<BaseContext, object, {
    session: {
        [k: string]: unknown;
        user?: unknown;
    };
}, import("@trpc/server").TRPCUnsetMarker, import("@trpc/server").TRPCUnsetMarker, import("@trpc/server").TRPCUnsetMarker, import("@trpc/server").TRPCUnsetMarker, false>;
export type Context = BaseContext;
//# sourceMappingURL=trpc.d.ts.map