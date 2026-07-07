import { teilnehmerRepo } from "@/lib/server/db";
import { entityRoute } from "@/lib/server/routen";
import type { Teilnehmer } from "@/lib/types";

export const dynamic = "force-dynamic";

const route = entityRoute<Teilnehmer>(teilnehmerRepo);
export const POST = route.POST;
export const DELETE = route.DELETE;
