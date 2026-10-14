import { DatabaseSync } from "node:sqlite";

const db = new DatabaseSync("data/koskembali.sqlite");
db.exec("PRAGMA foreign_keys = ON");

console.log("FK violations   :", db.prepare("PRAGMA foreign_key_check").all().length);
console.log("integrity_check :", JSON.stringify(db.prepare("PRAGMA integrity_check").get()));
console.log(
  "dup active/item :",
  db
    .prepare(
      "SELECT item_id, COUNT(*) AS n FROM booking WHERE status <> 'cancelled' GROUP BY item_id HAVING n > 1",
    )
    .all().length,
);
console.log(
  "buyer campus bad:",
  db
    .prepare("SELECT COUNT(*) AS n FROM buyer WHERE campus_id NOT IN (SELECT id FROM campus)")
    .get().n,
);
console.log(
  "reserved no bk  :",
  db
    .prepare(
      "SELECT COUNT(*) AS n FROM item i WHERE i.status = 'reserved' AND NOT EXISTS (SELECT 1 FROM booking b WHERE b.item_id = i.id)",
    )
    .get().n,
);
console.log(
  "sold no booking :",
  db
    .prepare(
      "SELECT COUNT(*) AS n FROM item i WHERE i.status = 'sold' AND NOT EXISTS (SELECT 1 FROM booking b WHERE b.item_id = i.id)",
    )
    .get().n,
);
console.log(
  "bookings        :",
  JSON.stringify(db.prepare("SELECT kode, item_id, status FROM booking ORDER BY kode").all()),
);
console.log(
  "counts          :",
  JSON.stringify({
    campus: db.prepare("SELECT COUNT(*) AS n FROM campus").get().n,
    seller: db.prepare("SELECT COUNT(*) AS n FROM seller").get().n,
    buyer: db.prepare("SELECT COUNT(*) AS n FROM buyer").get().n,
    pickup: db.prepare("SELECT COUNT(*) AS n FROM pickup_request").get().n,
    item: db.prepare("SELECT COUNT(*) AS n FROM item").get().n,
    photo: db.prepare("SELECT COUNT(*) AS n FROM item_photo").get().n,
    booking: db.prepare("SELECT COUNT(*) AS n FROM booking").get().n,
    coordinator: db.prepare("SELECT COUNT(*) AS n FROM coordinator").get().n,
    settlement: db.prepare("SELECT COUNT(*) AS n FROM settlement").get().n,
  }),
);