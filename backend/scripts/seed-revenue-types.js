const AWS = require('aws-sdk');

const tableName =
  process.env.DYNAMODB_REVENUE_TYPE_TABLE_NAME ||
  process.env.DYNAMODB_REVENUE_TABLE_NAME ||
  process.env.DYNAMODB_GRANT_TABLE_NAME;

if (!tableName) {
  console.error('Missing table');
  process.exit(1);
}

AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.OPEN_HATCH,
  secretAccessKey: process.env.CLOSED_HATCH,
});

const docClient = new AWS.DynamoDB.DocumentClient();

const seedRows = [
  { revenueTypeId: 1000, name: 'Grants' },
  { revenueTypeId: 1001, name: 'Individual Donations' },
  { revenueTypeId: 1002, name: 'Corporate Sponsorships' },
  { revenueTypeId: 1003, name: 'Fundraising Events' },
  { revenueTypeId: 1004, name: 'Other Revenue' },
];

async function run() {
  const now = new Date().toISOString();

  for (const row of seedRows) {
    const params = {
      TableName: tableName,
      Item: {
        revenueTypeId: row.revenueTypeId,
        name: row.name,
        description: `Seeded revenue type: ${row.name}`,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    };

    await docClient.put(params).promise();
    console.log(`Seeded ${row.revenueTypeId} - ${row.name}`);
  }

  console.log('Revenue type seed done');
}

run().catch((error) => {
  console.error('Revenue seed failed:', error);
  process.exit(1);
});
