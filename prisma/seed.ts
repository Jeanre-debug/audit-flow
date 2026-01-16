import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding audit templates...')

  // Get the first organization or create a demo one
  let organization = await prisma.organization.findFirst()

  if (!organization) {
    organization = await prisma.organization.create({
      data: {
        name: 'Demo Organization',
        slug: 'demo-org',
      },
    })
    console.log('Created demo organization')
  }

  // =============================================
  // FOOD SAFETY AUDIT TEMPLATE
  // =============================================
  const foodSafetyTemplate = await prisma.auditTemplate.create({
    data: {
      organizationId: organization.id,
      name: 'Food Safety Audit',
      description: 'Comprehensive food safety inspection covering hygiene, storage, temperature control, and compliance with food safety regulations.',
      category: 'food-safety',
      passingScore: 80,
      isPublished: true,
      sections: {
        create: [
          {
            title: 'Personal Hygiene',
            description: 'Staff hygiene and handwashing practices',
            order: 1,
            weight: 1,
            questions: {
              create: [
                {
                  text: 'Are all staff wearing clean uniforms/protective clothing?',
                  type: 'yes_no',
                  isRequired: true,
                  isCritical: false,
                  order: 1,
                  weight: 1,
                },
                {
                  text: 'Are staff washing hands correctly and frequently?',
                  type: 'yes_no',
                  isRequired: true,
                  isCritical: true,
                  order: 2,
                  weight: 2,
                },
                {
                  text: 'Is handwashing signage displayed at all sinks?',
                  type: 'yes_no',
                  isRequired: true,
                  isCritical: false,
                  order: 3,
                  weight: 1,
                },
                {
                  text: 'Are disposable gloves available and being used correctly?',
                  type: 'yes_no',
                  isRequired: true,
                  isCritical: false,
                  order: 4,
                  weight: 1,
                },
                {
                  text: 'Are hair nets/caps being worn in food preparation areas?',
                  type: 'yes_no',
                  isRequired: true,
                  isCritical: false,
                  order: 5,
                  weight: 1,
                },
                {
                  text: 'Rate overall staff hygiene compliance',
                  type: 'rating',
                  isRequired: true,
                  isCritical: false,
                  order: 6,
                  weight: 1,
                  config: { min: 1, max: 5 },
                },
              ],
            },
          },
          {
            title: 'Temperature Control',
            description: 'Refrigeration, freezer, and hot holding temperatures',
            order: 2,
            weight: 2,
            questions: {
              create: [
                {
                  text: 'Refrigerator temperature (should be 0-5°C)',
                  type: 'numeric',
                  isRequired: true,
                  isCritical: true,
                  order: 1,
                  weight: 2,
                  minValue: -2,
                  maxValue: 8,
                  targetValue: 3,
                  unit: '°C',
                },
                {
                  text: 'Freezer temperature (should be -18°C or below)',
                  type: 'numeric',
                  isRequired: true,
                  isCritical: true,
                  order: 2,
                  weight: 2,
                  minValue: -30,
                  maxValue: -15,
                  targetValue: -18,
                  unit: '°C',
                },
                {
                  text: 'Hot holding temperature (should be 63°C or above)',
                  type: 'numeric',
                  isRequired: true,
                  isCritical: true,
                  order: 3,
                  weight: 2,
                  minValue: 60,
                  maxValue: 100,
                  targetValue: 65,
                  unit: '°C',
                },
                {
                  text: 'Are temperature logs being completed daily?',
                  type: 'yes_no',
                  isRequired: true,
                  isCritical: false,
                  order: 4,
                  weight: 1,
                },
                {
                  text: 'Are thermometers calibrated and working correctly?',
                  type: 'yes_no',
                  isRequired: true,
                  isCritical: false,
                  order: 5,
                  weight: 1,
                },
                {
                  text: 'Take photo of temperature display',
                  type: 'photo',
                  isRequired: false,
                  isCritical: false,
                  order: 6,
                  weight: 0,
                },
              ],
            },
          },
          {
            title: 'Food Storage',
            description: 'Proper storage, labeling, and stock rotation',
            order: 3,
            weight: 1,
            questions: {
              create: [
                {
                  text: 'Is raw meat stored separately from ready-to-eat foods?',
                  type: 'yes_no',
                  isRequired: true,
                  isCritical: true,
                  order: 1,
                  weight: 2,
                },
                {
                  text: 'Are all food items properly labeled with use-by dates?',
                  type: 'yes_no',
                  isRequired: true,
                  isCritical: false,
                  order: 2,
                  weight: 1,
                },
                {
                  text: 'Is FIFO (First In, First Out) being followed?',
                  type: 'yes_no',
                  isRequired: true,
                  isCritical: false,
                  order: 3,
                  weight: 1,
                },
                {
                  text: 'Are dry goods stored off the floor (min 15cm)?',
                  type: 'yes_no',
                  isRequired: true,
                  isCritical: false,
                  order: 4,
                  weight: 1,
                },
                {
                  text: 'Are storage containers clean and in good condition?',
                  type: 'yes_no',
                  isRequired: true,
                  isCritical: false,
                  order: 5,
                  weight: 1,
                },
                {
                  text: 'Are allergens stored and labeled separately?',
                  type: 'yes_no',
                  isRequired: true,
                  isCritical: true,
                  order: 6,
                  weight: 2,
                },
              ],
            },
          },
          {
            title: 'Cleaning & Sanitation',
            description: 'Cleanliness of equipment, surfaces, and facilities',
            order: 4,
            weight: 1,
            questions: {
              create: [
                {
                  text: 'Are food preparation surfaces clean and sanitized?',
                  type: 'pass_fail',
                  isRequired: true,
                  isCritical: true,
                  order: 1,
                  weight: 2,
                },
                {
                  text: 'Is cleaning equipment stored correctly?',
                  type: 'yes_no',
                  isRequired: true,
                  isCritical: false,
                  order: 2,
                  weight: 1,
                },
                {
                  text: 'Are cleaning schedules displayed and followed?',
                  type: 'yes_no',
                  isRequired: true,
                  isCritical: false,
                  order: 3,
                  weight: 1,
                },
                {
                  text: 'Are sanitizers at correct dilution?',
                  type: 'yes_no',
                  isRequired: true,
                  isCritical: false,
                  order: 4,
                  weight: 1,
                },
                {
                  text: 'Are waste bins emptied regularly and clean?',
                  type: 'yes_no',
                  isRequired: true,
                  isCritical: false,
                  order: 5,
                  weight: 1,
                },
                {
                  text: 'Rate overall cleanliness',
                  type: 'rating',
                  isRequired: true,
                  isCritical: false,
                  order: 6,
                  weight: 1,
                  config: { min: 1, max: 5 },
                },
              ],
            },
          },
          {
            title: 'Pest Control',
            description: 'Evidence of pests and prevention measures',
            order: 5,
            weight: 1,
            questions: {
              create: [
                {
                  text: 'Is there any evidence of pest activity?',
                  type: 'yes_no',
                  isRequired: true,
                  isCritical: true,
                  order: 1,
                  weight: 2,
                },
                {
                  text: 'Are pest control records up to date?',
                  type: 'yes_no',
                  isRequired: true,
                  isCritical: false,
                  order: 2,
                  weight: 1,
                },
                {
                  text: 'Are external doors fitted with fly screens/air curtains?',
                  type: 'yes_no',
                  isRequired: true,
                  isCritical: false,
                  order: 3,
                  weight: 1,
                },
                {
                  text: 'Are all gaps and holes sealed?',
                  type: 'yes_no',
                  isRequired: true,
                  isCritical: false,
                  order: 4,
                  weight: 1,
                },
                {
                  text: 'Add photo evidence if pest activity found',
                  type: 'photo',
                  isRequired: false,
                  isCritical: false,
                  order: 5,
                  weight: 0,
                },
              ],
            },
          },
          {
            title: 'Documentation & Training',
            description: 'HACCP records, training certificates, and compliance documents',
            order: 6,
            weight: 1,
            questions: {
              create: [
                {
                  text: 'Is HACCP documentation available and current?',
                  type: 'yes_no',
                  isRequired: true,
                  isCritical: false,
                  order: 1,
                  weight: 1,
                },
                {
                  text: 'Do all staff have valid food safety training certificates?',
                  type: 'yes_no',
                  isRequired: true,
                  isCritical: false,
                  order: 2,
                  weight: 1,
                },
                {
                  text: 'Are allergen information records available?',
                  type: 'yes_no',
                  isRequired: true,
                  isCritical: true,
                  order: 3,
                  weight: 2,
                },
                {
                  text: 'Is supplier documentation and traceability maintained?',
                  type: 'yes_no',
                  isRequired: true,
                  isCritical: false,
                  order: 4,
                  weight: 1,
                },
                {
                  text: 'Additional comments on documentation',
                  type: 'text',
                  isRequired: false,
                  isCritical: false,
                  order: 5,
                  weight: 0,
                },
              ],
            },
          },
        ],
      },
    },
  })

  console.log('Created Food Safety Audit template:', foodSafetyTemplate.id)

  // =============================================
  // HEALTH & SAFETY AUDIT TEMPLATE
  // =============================================
  const healthSafetyTemplate = await prisma.auditTemplate.create({
    data: {
      organizationId: organization.id,
      name: 'Health & Safety Audit',
      description: 'Comprehensive workplace health and safety inspection covering fire safety, first aid, PPE, hazard identification, and regulatory compliance.',
      category: 'health-safety',
      passingScore: 85,
      isPublished: true,
      sections: {
        create: [
          {
            title: 'Fire Safety',
            description: 'Fire prevention, detection, and emergency procedures',
            order: 1,
            weight: 2,
            questions: {
              create: [
                {
                  text: 'Are fire exits clearly marked and unobstructed?',
                  type: 'yes_no',
                  isRequired: true,
                  isCritical: true,
                  order: 1,
                  weight: 2,
                },
                {
                  text: 'Are fire extinguishers in place and within service date?',
                  type: 'yes_no',
                  isRequired: true,
                  isCritical: true,
                  order: 2,
                  weight: 2,
                },
                {
                  text: 'Is the fire alarm system tested weekly?',
                  type: 'yes_no',
                  isRequired: true,
                  isCritical: false,
                  order: 3,
                  weight: 1,
                },
                {
                  text: 'Are emergency evacuation plans displayed?',
                  type: 'yes_no',
                  isRequired: true,
                  isCritical: false,
                  order: 4,
                  weight: 1,
                },
                {
                  text: 'When was the last fire drill conducted?',
                  type: 'text',
                  isRequired: true,
                  isCritical: false,
                  order: 5,
                  weight: 1,
                },
                {
                  text: 'Are fire doors self-closing and not propped open?',
                  type: 'yes_no',
                  isRequired: true,
                  isCritical: true,
                  order: 6,
                  weight: 2,
                },
                {
                  text: 'Take photo of fire exit signage',
                  type: 'photo',
                  isRequired: false,
                  isCritical: false,
                  order: 7,
                  weight: 0,
                },
              ],
            },
          },
          {
            title: 'First Aid',
            description: 'First aid provisions and trained personnel',
            order: 2,
            weight: 1,
            questions: {
              create: [
                {
                  text: 'Is a first aid kit available and fully stocked?',
                  type: 'yes_no',
                  isRequired: true,
                  isCritical: true,
                  order: 1,
                  weight: 2,
                },
                {
                  text: 'Are trained first aiders on site?',
                  type: 'yes_no',
                  isRequired: true,
                  isCritical: false,
                  order: 2,
                  weight: 1,
                },
                {
                  text: 'Is the first aid kit location clearly marked?',
                  type: 'yes_no',
                  isRequired: true,
                  isCritical: false,
                  order: 3,
                  weight: 1,
                },
                {
                  text: 'Are first aider names and contact details displayed?',
                  type: 'yes_no',
                  isRequired: true,
                  isCritical: false,
                  order: 4,
                  weight: 1,
                },
                {
                  text: 'Is the accident book up to date?',
                  type: 'yes_no',
                  isRequired: true,
                  isCritical: false,
                  order: 5,
                  weight: 1,
                },
                {
                  text: 'Number of trained first aiders',
                  type: 'numeric',
                  isRequired: true,
                  isCritical: false,
                  order: 6,
                  weight: 1,
                  minValue: 0,
                  maxValue: 50,
                },
              ],
            },
          },
          {
            title: 'Personal Protective Equipment (PPE)',
            description: 'Availability and use of required PPE',
            order: 3,
            weight: 1,
            questions: {
              create: [
                {
                  text: 'Is appropriate PPE provided for all tasks?',
                  type: 'yes_no',
                  isRequired: true,
                  isCritical: true,
                  order: 1,
                  weight: 2,
                },
                {
                  text: 'Is PPE being worn correctly by all staff?',
                  type: 'yes_no',
                  isRequired: true,
                  isCritical: false,
                  order: 2,
                  weight: 1,
                },
                {
                  text: 'Is PPE in good condition (no damage/wear)?',
                  type: 'yes_no',
                  isRequired: true,
                  isCritical: false,
                  order: 3,
                  weight: 1,
                },
                {
                  text: 'Are PPE storage facilities adequate?',
                  type: 'yes_no',
                  isRequired: true,
                  isCritical: false,
                  order: 4,
                  weight: 1,
                },
                {
                  text: 'Have staff been trained on correct PPE usage?',
                  type: 'yes_no',
                  isRequired: true,
                  isCritical: false,
                  order: 5,
                  weight: 1,
                },
                {
                  text: 'Rate overall PPE compliance',
                  type: 'rating',
                  isRequired: true,
                  isCritical: false,
                  order: 6,
                  weight: 1,
                  config: { min: 1, max: 5 },
                },
              ],
            },
          },
          {
            title: 'Workplace Hazards',
            description: 'Identification and control of workplace hazards',
            order: 4,
            weight: 2,
            questions: {
              create: [
                {
                  text: 'Are walkways clear and free from trip hazards?',
                  type: 'yes_no',
                  isRequired: true,
                  isCritical: false,
                  order: 1,
                  weight: 1,
                },
                {
                  text: 'Is lighting adequate in all work areas?',
                  type: 'yes_no',
                  isRequired: true,
                  isCritical: false,
                  order: 2,
                  weight: 1,
                },
                {
                  text: 'Are electrical cables properly managed (no trailing wires)?',
                  type: 'yes_no',
                  isRequired: true,
                  isCritical: false,
                  order: 3,
                  weight: 1,
                },
                {
                  text: 'Are hazardous substances stored correctly (COSHH)?',
                  type: 'yes_no',
                  isRequired: true,
                  isCritical: true,
                  order: 4,
                  weight: 2,
                },
                {
                  text: 'Are wet floor signs available and used?',
                  type: 'yes_no',
                  isRequired: true,
                  isCritical: false,
                  order: 5,
                  weight: 1,
                },
                {
                  text: 'Is machinery properly guarded?',
                  type: 'yes_no',
                  isRequired: true,
                  isCritical: true,
                  order: 6,
                  weight: 2,
                },
                {
                  text: 'Take photo of any hazards identified',
                  type: 'photo',
                  isRequired: false,
                  isCritical: false,
                  order: 7,
                  weight: 0,
                },
              ],
            },
          },
          {
            title: 'Electrical Safety',
            description: 'Electrical equipment and installation safety',
            order: 5,
            weight: 1,
            questions: {
              create: [
                {
                  text: 'Are PAT test records up to date?',
                  type: 'yes_no',
                  isRequired: true,
                  isCritical: false,
                  order: 1,
                  weight: 1,
                },
                {
                  text: 'Are sockets and switches in good condition?',
                  type: 'yes_no',
                  isRequired: true,
                  isCritical: false,
                  order: 2,
                  weight: 1,
                },
                {
                  text: 'Are extension leads used appropriately (not daisy-chained)?',
                  type: 'yes_no',
                  isRequired: true,
                  isCritical: false,
                  order: 3,
                  weight: 1,
                },
                {
                  text: 'Is the electrical distribution board accessible and labeled?',
                  type: 'yes_no',
                  isRequired: true,
                  isCritical: false,
                  order: 4,
                  weight: 1,
                },
                {
                  text: 'Date of last electrical installation inspection',
                  type: 'text',
                  isRequired: false,
                  isCritical: false,
                  order: 5,
                  weight: 0,
                },
              ],
            },
          },
          {
            title: 'Manual Handling',
            description: 'Manual handling practices and equipment',
            order: 6,
            weight: 1,
            questions: {
              create: [
                {
                  text: 'Have staff received manual handling training?',
                  type: 'yes_no',
                  isRequired: true,
                  isCritical: false,
                  order: 1,
                  weight: 1,
                },
                {
                  text: 'Are lifting aids available where needed?',
                  type: 'yes_no',
                  isRequired: true,
                  isCritical: false,
                  order: 2,
                  weight: 1,
                },
                {
                  text: 'Are heavy items stored at appropriate heights?',
                  type: 'yes_no',
                  isRequired: true,
                  isCritical: false,
                  order: 3,
                  weight: 1,
                },
                {
                  text: 'Is team lifting practiced for heavy loads?',
                  type: 'yes_no',
                  isRequired: true,
                  isCritical: false,
                  order: 4,
                  weight: 1,
                },
              ],
            },
          },
          {
            title: 'Documentation & Compliance',
            description: 'Health and safety documentation and legal compliance',
            order: 7,
            weight: 1,
            questions: {
              create: [
                {
                  text: 'Is the Health & Safety Policy displayed?',
                  type: 'yes_no',
                  isRequired: true,
                  isCritical: false,
                  order: 1,
                  weight: 1,
                },
                {
                  text: 'Are risk assessments up to date?',
                  type: 'yes_no',
                  isRequired: true,
                  isCritical: true,
                  order: 2,
                  weight: 2,
                },
                {
                  text: 'Is employers liability insurance displayed?',
                  type: 'yes_no',
                  isRequired: true,
                  isCritical: false,
                  order: 3,
                  weight: 1,
                },
                {
                  text: 'Are safety data sheets (SDS) available for chemicals?',
                  type: 'yes_no',
                  isRequired: true,
                  isCritical: false,
                  order: 4,
                  weight: 1,
                },
                {
                  text: 'Is the HSE law poster displayed?',
                  type: 'yes_no',
                  isRequired: true,
                  isCritical: false,
                  order: 5,
                  weight: 1,
                },
                {
                  text: 'Additional observations',
                  type: 'text',
                  isRequired: false,
                  isCritical: false,
                  order: 6,
                  weight: 0,
                },
              ],
            },
          },
        ],
      },
    },
  })

  console.log('Created Health & Safety Audit template:', healthSafetyTemplate.id)

  console.log('Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
