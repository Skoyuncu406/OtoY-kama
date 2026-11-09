import "dotenv/config";

import { randomBytes } from "node:crypto";
import { createRequire } from "node:module";
import { PrismaClient } from "../src/generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";

const require = createRequire(import.meta.url);
const {
  PrismaClientKnownRequestError,
} = require("@prisma/client/runtime/client");

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL tanımlanmamış.");
}

const adapter = new PrismaPg({
  connectionString,
  max: 5,
  connectionTimeoutMillis: 10000,
});

const prisma = new PrismaClient({
  adapter,
  log: ["warn", "error"],
});

function generateTrackingCode() {
  return `VTX-${randomBytes(24).toString("hex").toUpperCase()}`;
}

async function main() {
  const orders = await prisma.order.findMany({
    where: {
      trackingCode: null,
    },
    select: {
      id: true,
      orderNumber: true,
    },
  });

  console.log(`Takip kodu olmayan sipariş: ${orders.length}`);

  let updated = 0;

  for (const order of orders) {
    let completed = false;

    for (let attempt = 0; attempt < 3; attempt++) {
      const trackingCode = generateTrackingCode();

      try {
        const result = await prisma.order.updateMany({
          where: {
            id: order.id,
            trackingCode: null,
          },
          data: {
            trackingCode,
          },
        });

        if (result.count === 1) {
          updated++;
          console.log(`${order.orderNumber}: Takip kodu oluşturuldu.`);
        }

        completed = true;
        break;
      } catch (error) {
        if (
          error instanceof PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          continue;
        }

        throw error;
      }
    }

    if (!completed) {
      throw new Error(
        `${order.orderNumber} için benzersiz takip kodu oluşturulamadı.`,
      );
    }
  }

  console.log(`İşlem tamamlandı. Güncellenen sipariş: ${updated}`);
}

main()
  .catch((error) => {
    console.error("Takip kodu güncelleme hatası:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
