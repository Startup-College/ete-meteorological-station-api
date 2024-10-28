-- CreateTable
CREATE TABLE "stations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "latitude" TEXT NOT NULL,
    "longitude" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "readings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "station_id" TEXT NOT NULL,
    "date_time" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "temperature" REAL NOT NULL,
    "humidity" REAL NOT NULL,
    "rainfall_volume" REAL NOT NULL,
    CONSTRAINT "readings_station_id_fkey" FOREIGN KEY ("station_id") REFERENCES "stations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
