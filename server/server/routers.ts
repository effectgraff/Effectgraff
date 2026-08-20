import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import {
  addLeadNote,
  createLead,
  createLeadTask,
  listLeadNotes,
  listLeadTasks,
  listLeads,
  toggleLeadTask,
  updateLeadStatus,
} from "./db";

const leadStatus = z.enum(["new", "qualified", "proposal", "won", "lost"]);
const trimmedText = (max: number) => z.string().trim().min(1).max(max);

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  leads: router({
    create: publicProcedure
      .input(z.object({
        city: trimmedText(160),
        contact: trimmedText(320),
        wallSize: trimmedText(160),
        budget: trimmedText(160),
        projectType: z.string().trim().max(160).optional(),
        timing: z.string().trim().max(160).optional(),
        details: z.string().trim().max(5000).optional(),
        language: z.enum(["ru", "en"]).default("ru"),
        source: z.string().trim().max(80).default("website_brief"),
        consent: z.literal(true),
        website: z.string().max(0).optional(),
      }))
      .mutation(async ({ input }) => {
        if (input.website) throw new Error("Invalid submission");
        const { consent: _consent, website: _website, ...lead } = input;
        return createLead(lead);
      }),
    list: adminProcedure.query(() => listLeads()),
    updateStatus: adminProcedure
      .input(z.object({ id: z.number().int().positive(), status: leadStatus, nextFollowUpAt: z.coerce.date().nullable().optional() }))
      .mutation(({ input }) => updateLeadStatus(input.id, input.status, input.nextFollowUpAt)),
    notes: router({
      list: adminProcedure.input(z.object({ leadId: z.number().int().positive() })).query(({ input }) => listLeadNotes(input.leadId)),
      add: adminProcedure.input(z.object({ leadId: z.number().int().positive(), body: trimmedText(5000) })).mutation(({ ctx, input }) => addLeadNote({ leadId: input.leadId, authorId: ctx.user.id, body: input.body })),
    }),
    tasks: router({
      list: adminProcedure.input(z.object({ leadId: z.number().int().positive().optional() })).query(({ input }) => listLeadTasks(input.leadId)),
      create: adminProcedure.input(z.object({ leadId: z.number().int().positive(), title: trimmedText(240), dueAt: z.coerce.date().nullable().optional() })).mutation(({ ctx, input }) => createLeadTask({ leadId: input.leadId, title: input.title, dueAt: input.dueAt, createdBy: ctx.user.id })),
      toggle: adminProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(["open", "done"]) })).mutation(({ input }) => toggleLeadTask(input.id, input.status)),
    }),
  }),
});

export type AppRouter = typeof appRouter;
