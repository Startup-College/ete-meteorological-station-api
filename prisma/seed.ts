import { prisma } from '../src/lib/prisma';

async function seed() {
  const station = await prisma.station.create({
    data: {
      name: 'ETE Station Monitoring Example',
      latitude: '-8.139549723590184',
      longitude: '-34.9463608687136'
    }
  });

  await prisma.reading.createMany({
    data: [
      {
        stationId: station.id,
        temperature: 18.0,
        humidity: 70,
        rainfallVolume: 10.0
      },
      {
        stationId: station.id,
        temperature: 23.0,
        humidity: 55,
        rainfallVolume: 0.0
      },
      {
        stationId: station.id,
        temperature: 25.0,
        humidity: 65,
        rainfallVolume: 2.0
      },
      {
        stationId: station.id,
        temperature: 26.0,
        humidity: 62,
        rainfallVolume: 0.5
      },
      {
        stationId: station.id,
        temperature: 18.0,
        humidity: 70,
        rainfallVolume: 10.0
      }
    ]
  });
}

seed().then(() => {
  console.log('Database seeded!');
  prisma.$disconnect();
});
