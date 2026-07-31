import type {
  EventType,
  InvitationStatus,
  VendorCategory,
  VendorStatus,
  MenuCourse,
  MusicStatus,
} from "@/generated/prisma/enums";

export const eventTypeLabels: Record<EventType, string> = {
  BODA: "Boda",
  XV_ANOS: "XV años",
  CUMPLEANOS: "Cumpleaños",
  CORPORATIVO: "Corporativo",
  OTRO: "Otro",
};

export const invitationStatusLabels: Record<InvitationStatus, string> = {
  NO_ENVIADA: "No enviada",
  ENVIADA: "Enviada",
  CONFIRMADA: "Confirmada",
  RECHAZADA: "Rechazada",
};

export const invitationStatusTone: Record<InvitationStatus, "neutral" | "warn" | "good" | "bad"> = {
  NO_ENVIADA: "neutral",
  ENVIADA: "warn",
  CONFIRMADA: "good",
  RECHAZADA: "bad",
};

export const vendorCategoryLabels: Record<VendorCategory, string> = {
  CATERING: "Catering",
  DJ: "DJ",
  FOTOGRAFIA: "Fotografía",
  FLORES: "Flores",
  SALON: "Salón",
  MOBILIARIO: "Mobiliario",
  OTRO: "Otro",
};

export const vendorStatusLabels: Record<VendorStatus, string> = {
  COTIZADO: "Cotizado",
  CONTRATADO: "Contratado",
  PAGADO: "Pagado",
};

export const vendorStatusTone: Record<VendorStatus, "neutral" | "warn" | "good" | "bad"> = {
  COTIZADO: "warn",
  CONTRATADO: "neutral",
  PAGADO: "good",
};

export const menuCourseLabels: Record<MenuCourse, string> = {
  ENTRADA: "Entrada",
  PLATO_FUERTE: "Plato fuerte",
  POSTRE: "Postre",
  BEBIDA: "Bebida",
};

export const musicStatusLabels: Record<MusicStatus, string> = {
  PENDIENTE: "Pendiente",
  CONFIRMADA: "Confirmada",
};

export const musicStatusTone: Record<MusicStatus, "neutral" | "warn" | "good" | "bad"> = {
  PENDIENTE: "warn",
  CONFIRMADA: "good",
};
