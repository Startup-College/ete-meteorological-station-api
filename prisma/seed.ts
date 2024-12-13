import { prisma } from '../src/lib/prisma';

async function seed() {
  await prisma.reading.deleteMany();
  await prisma.station.deleteMany();

  const station = await prisma.station.create({
    data: {
      name: 'ETE Station Monitoring Example',
      latitude: '-8.139549723590184',
      longitude: '-34.9463608687136'
    }
  });

  const generateReadings = (
    stationId: number,
    startDate: Date,
    endDate: Date,
    maxHoursDifference: number,
    maxRecords: number
  ) => {
    const readings: {
      stationId: number;
      temperature: number;
      humidity: number;
      rainfallVolume: number;
      dateTime: Date;
    }[] = [];

    let currentDate = new Date(endDate);

    while (currentDate >= startDate && readings.length < maxRecords) {
      readings.push({
        stationId: stationId,
        temperature: parseFloat((Math.random() * 15 + 10).toFixed(1)), // Temperatura entre 10 e 25°C
        humidity: Math.floor(Math.random() * 50 + 50), // Umidade entre 50% e 100%
        rainfallVolume: parseFloat((Math.random() * 20).toFixed(1)), // Volume de chuva entre 0 e 20mm
        dateTime: new Date(currentDate) // Criar uma nova instância de Date
      });

      // Subtrair entre 1 e maxHoursDifference horas
      const hoursToSubtract = Math.floor(Math.random() * maxHoursDifference) + 1;
      currentDate = new Date(currentDate);
      currentDate.setHours(currentDate.getHours() - hoursToSubtract);
    }

    return readings;
  };

  const now = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(now.getMonth() - 3);

  // Gerar até 200 registros
  const readingsArray = generateReadings(station.id, threeMonthsAgo, now, 1, 200);

  // Inserir leituras na base de dados
  await prisma.reading.createMany({
    data: readingsArray
  });

  console.log('Database seeded with dynamic readings!');
  await prisma.$disconnect();
}

seed().catch((error) => {
  console.error('Error seeding database:', error);
  prisma.$disconnect();
  process.exit(1);
});
