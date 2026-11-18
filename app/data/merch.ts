export type GrupoTallas = { etiqueta: string; tallas: string[] };

export type Producto = {
  id: string;
  nombre: string;
  /** "la camiseta", "el pantalón": usado en el mensaje de reserva. */
  articulo: "el" | "la";
  precio: number;
  /** Precio sin descuento (solo para el pack). */
  precioAnterior?: number;
  destacado?: boolean;
  descripcion: string;
  detalles: string[];
  tallas: GrupoTallas[];
};

const TALLAS_CAMISETA: GrupoTallas[] = [
  { etiqueta: "Niño", tallas: ["1/2", "3/4", "5/6", "7/8", "9/10", "11/12"] },
  { etiqueta: "Adulto", tallas: ["XS", "S", "M", "L", "XL", "2XL", "3XL"] },
];

const TALLAS_PANTALON: GrupoTallas[] = [
  { etiqueta: "Niño", tallas: ["5/6", "7/8", "9/11", "12/13", "14"] },
  { etiqueta: "Adulto", tallas: ["S", "M", "L", "XL", "XXL"] },
];

export const MERCH_INSTAGRAM = "bykanot";
export const MERCH_INSTAGRAM_DM = `https://ig.me/m/${MERCH_INSTAGRAM}`;

/** Reservas por WhatsApp (679 507 935), con el mensaje ya escrito. */
export const MERCH_WHATSAPP = "34679507935";
export function whatsappUrl(texto?: string) {
  const base = `https://wa.me/${MERCH_WHATSAPP}`;
  return texto ? `${base}?text=${encodeURIComponent(texto)}` : base;
}

export const productos: Producto[] = [
  {
    id: "camiseta",
    nombre: "Camiseta",
    articulo: "la",
    precio: 15,
    descripcion: "Camiseta negra con el escudo rosa delante y KANOT en azul en la espalda.",
    detalles: ["Escudo ByKanot en el pecho", "Logo KANOT en la espalda", "Tallas de niño y adulto"],
    tallas: TALLAS_CAMISETA,
  },
  {
    id: "pack",
    nombre: "Pack completo",
    articulo: "el",
    precio: 35,
    precioAnterior: 40,
    destacado: true,
    descripcion: "Camiseta y pantalón juntos. El look completo de la crew para esta temporada.",
    detalles: ["Camiseta + pantalón", "Ahorras 5 €", "Elige una talla para cada prenda"],
    tallas: [],
  },
  {
    id: "pantalon",
    nombre: "Pantalón",
    articulo: "el",
    precio: 25,
    descripcion: "Pantalón ancho negro con KANOT en vertical en la pierna. Cómodo para entrenar.",
    detalles: ["Corte ancho con goma", "Logo KANOT en la pierna", "Tallas de niño y adulto"],
    tallas: TALLAS_PANTALON,
  },
];

export const TALLAS = { camiseta: TALLAS_CAMISETA, pantalon: TALLAS_PANTALON };

export const merchGaleria = [
  { src: "/imagenes/merch/camiseta-detalle.jpg", alt: "Detalle del escudo en la camiseta" },
  { src: "/imagenes/merch/camiseta-doblada.jpg", alt: "Camisetas ByKanot dobladas" },
  { src: "/imagenes/merch/camiseta-espalda.jpg", alt: "Espalda de la camiseta con el logo KANOT" },
];
