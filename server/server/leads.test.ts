import { describe, expect, it, vi } from "vitest";

vi.mock("./db", () => ({
  addLeadNote: vi.fn(),
  createLead: vi.fn().mockResolvedValue({ id: 42 }),
  createLeadTask: vi.fn(),
  listLeadNotes: vi.fn(),
  listLeadTasks: vi.fn(),
  listLeads: vi.fn(),
  toggleLeadTask: vi.fn(),
  updateLeadStatus: vi.fn(),
}));

import { appRouter } from "./routers";
import { createLead } from "./db";

const caller = appRouter.createCaller({
  req: {} as never,
  res: {} as never,
  user: null,
});

describe("leads CRM contract", () => {
  it("creates a lead only after explicit consent", async () => {
    const result = await caller.leads.create({
      city: "Санкт-Петербург",
      contact: "+7 (995) 590-10-63",
      wallSize: "12 × 8 м",
      budget: "300 000 ₽",
      language: "ru",
      consent: true,
    });

    expect(result).toEqual({ id: 42 });
    expect(createLead).toHaveBeenCalledWith(expect.objectContaining({
      city: "Санкт-Петербург",
      contact: "+7 (995) 590-10-63",
      source: "website_brief",
    }));
  });

  it("rejects a lead without consent", async () => {
    await expect(caller.leads.create({
      city: "Москва",
      contact: "name@example.com",
      wallSize: "10 м",
      budget: "по согласованию",
      language: "ru",
      consent: false as true,
    })).rejects.toThrow();
  });

  it("keeps lead management admin-only", async () => {
    await expect(caller.leads.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
