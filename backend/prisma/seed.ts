import { PrismaClient, UserRole, MovementType, CaseMaterial, WatchCondition, ListingStatus, VerificationStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create brands
  const brands = await Promise.all([
    prisma.brand.create({
      data: {
        name: 'Rolex',
        slug: 'rolex',
        description: 'Швейцарский производитель премиальных часов',
        country: 'Швейцария',
        foundedYear: 1905,
      },
    }),
    prisma.brand.create({
      data: {
        name: 'Omega',
        slug: 'omega',
        description: 'Швейцарский производитель часов',
        country: 'Швейцария',
        foundedYear: 1848,
      },
    }),
    prisma.brand.create({
      data: {
        name: 'Patek Philippe',
        slug: 'patek-philippe',
        description: 'Швейцарский производитель эксклюзивных часов',
        country: 'Швейцария',
        foundedYear: 1839,
      },
    }),
    prisma.brand.create({
      data: {
        name: 'Audemars Piguet',
        slug: 'audemars-piguet',
        description: 'Швейцарский производитель премиальных часов',
        country: 'Швейцария',
        foundedYear: 1875,
      },
    }),
  ])

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@watchmarket.ru',
      password: '$2a$12$ea0/dP9CdbaqdsbWg1jP9.tFJVGU6Uqn8B9esAazWxMNjcPU6yXoK', // password: admin123
      name: 'Admin',
      role: UserRole.ADMIN,
      verificationStatus: VerificationStatus.VERIFIED,
    },
  })

  // Create watches
  const rolex = brands[0]
  const omega = brands[1]

  const watches = await Promise.all([
    prisma.watch.create({
      data: {
        brandId: rolex.id,
        model: 'Submariner',
        collection: 'Professional',
        reference: '116610LN',
        referenceDisplay: '116610LN',
        movementType: MovementType.AUTOMATIC,
        caseMaterial: CaseMaterial.STEEL,
        caseDiameter: 40,
        caseThickness: 12,
        waterResistance: 300,
        powerReserve: 48,
        crystal: 'Сапфировое',
        dialColor: 'Чёрный',
        braceletMaterial: 'Сталь',
        description: 'Легендарные дайверские часы Rolex Submariner с керамическим безелем',
        yearIntroduced: 2010,
        yearDiscontinued: 2020,
        createdBy: admin.id,
        images: {
          create: [
            { url: '/images/watches/submariner-1.jpg', order: 0, isMain: true },
            { url: '/images/watches/submariner-2.jpg', order: 1 },
          ],
        },
      },
    }),
    prisma.watch.create({
      data: {
        brandId: rolex.id,
        model: 'Daytona',
        collection: 'Professional',
        reference: '116500LN',
        referenceDisplay: '116500LN',
        movementType: MovementType.AUTOMATIC,
        caseMaterial: CaseMaterial.STEEL,
        caseDiameter: 40,
        caseThickness: 12.5,
        waterResistance: 100,
        powerReserve: 72,
        crystal: 'Сапфировое',
        dialColor: 'Белый',
        braceletMaterial: 'Сталь',
        description: 'Культовые хронографы Rolex Daytona',
        yearIntroduced: 2016,
        createdBy: admin.id,
        images: {
          create: [
            { url: '/images/watches/daytona-1.jpg', order: 0, isMain: true },
          ],
        },
      },
    }),
    prisma.watch.create({
      data: {
        brandId: omega.id,
        model: 'Speedmaster',
        collection: 'Professional',
        reference: '310.30.42.50.01.001',
        referenceDisplay: '310.30.42.50.01.001',
        movementType: MovementType.MANUAL_WIND,
        caseMaterial: CaseMaterial.STEEL,
        caseDiameter: 42,
        caseThickness: 13.6,
        waterResistance: 50,
        powerReserve: 50,
        crystal: 'Гесалит',
        dialColor: 'Чёрный',
        braceletMaterial: 'Сталь',
        description: 'Легендарные часы для космонавтов Omega Speedmaster Moonwatch',
        yearIntroduced: 2021,
        createdBy: admin.id,
        images: {
          create: [
            { url: '/images/watches/speedmaster-1.jpg', order: 0, isMain: true },
          ],
        },
      },
    }),
  ])

  // Create regular user
  const user = await prisma.user.create({
    data: {
      email: 'user@example.com',
      password: '$2a$12$Wnt86/2q8OC5M8IpTjpLm.Y2bx.ojGBptdAybb3mM1d4NXHyAX74W', // password: userpass1
      name: 'Иван Петров',
      phone: '+7 (999) 123-45-67',
      role: UserRole.USER,
      verificationStatus: VerificationStatus.VERIFIED,
      ratingsAvg: 4.8,
      ratingsCount: 12,
    },
  })

  // Create listings
  const listings = await Promise.all([
    prisma.listing.create({
      data: {
        watchId: watches[0].id,
        userId: user.id,
        price: 18500.00,
        negotiable: true,
        condition: WatchCondition.EXCELLENT,
        year: 2018,
        hasBox: true,
        hasPapers: true,
        hasOriginalStrap: true,
        description: 'Отличное состояние. Полный комплект. Обслуживание в 2023 году.',
        status: ListingStatus.ACTIVE,
        location: 'Москва',
        images: {
          create: [
            { url: '/images/listings/sub-listing-1.jpg', order: 0, isMain: true },
            { url: '/images/listings/sub-listing-2.jpg', order: 1 },
            { url: '/images/listings/sub-listing-3.jpg', order: 2 },
          ],
        },
      },
    }),
    prisma.listing.create({
      data: {
        watchId: watches[1].id,
        userId: user.id,
        price: 32000.00,
        negotiable: false,
        condition: WatchCondition.NEW,
        year: 2023,
        hasBox: true,
        hasPapers: true,
        hasOriginalStrap: true,
        description: 'Новые часы, никогда не носили. Полный комплект с бирками.',
        status: ListingStatus.ACTIVE,
        location: 'Санкт-Петербург',
        images: {
          create: [
            { url: '/images/listings/daytona-listing-1.jpg', order: 0, isMain: true },
          ],
        },
      },
    }),
  ])

  console.log('✅ Seed completed successfully!')
  console.log(`Created ${brands.length} brands`)
  console.log(`Created ${watches.length} watches`)
  console.log(`Created 2 users (admin + regular)`)
  console.log(`Created ${listings.length} listings`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
