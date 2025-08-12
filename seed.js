const bcrypt = require('bcryptjs');
const Product = require('./models/product.model')
const { generateRandomImageUrl } = require('./util/generate-random-image-url')
const { connectToDatabase, getDb } = require('./data/database')

async function run() {
  try {
    await connectToDatabase();  // sets `database` in database.js internally
    const db = getDb();  // get the shared db instance

    const collectionName = "users";

    // Define JSON schema for the users collection including new fields
    const schema = {
      $jsonSchema: {
        bsonType: "object",
        required: ["email", "password", "name", "address", "isAdmin"],
        properties: {
          email: {
            bsonType: "string",
            pattern: "^.+@.+$",
            description: "must be a valid email string and is required"
          },
          password: {
            bsonType: "string",
            description: "must be a string and is required"
          },
          name: {
            bsonType: "string",
            description: "must be a string and is required"
          },
          address: {
            bsonType: "object",
            required: ["street", "postalCode", "city"],
            properties: {
              street: {
                bsonType: "string",
                description: "must be a string and is required"
              },
              postalCode: {
                bsonType: "string",
                description: "must be a string and is required"
              },
              city: {
                bsonType: "string",
                description: "must be a string and is required"
              }
            }
          },
          isAdmin: {
            bsonType: "bool",
            description: "must be a boolean and is required"
          }
        }
      }
    };

    const options = {
      validator: schema,
      validationLevel: "strict",
      validationAction: "error"
    };

    // Check if collection exists
    const collections = await db.listCollections({ name: collectionName }).toArray();

    if (collections.length === 0) {
      await db.createCollection(collectionName, options);
      console.log(`Collection '${collectionName}' created with schema validation.`);
    } else {
      await db.command({
        collMod: collectionName,
        validator: schema,
        validationLevel: "strict",
        validationAction: "error"
      });
      console.log(`Collection '${collectionName}' schema validation updated.`);
    }

    // Hash the password with salt rounds 12
    const plainPassword = 'Password123!';
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

    // Prepare admin user doc with new fields
    const adminUser = {
      email: 'cloudAdmin2@yahoo.com',
      password: hashedPassword,
      name: 'adminUser2',
      address: {
        street: 'admin street',
        postalCode: '00000',
        city: 'Auckland'
      },
      isAdmin: true
    };

    // Check if admin user exists
    const existingAdmin = await db.collection(collectionName).findOne({ email: adminUser.email });

    if (!existingAdmin) {
      await db.collection(collectionName).insertOne(adminUser);
      console.log("Initial admin user created.");
    } else {
      console.log("Admin user already exists, skipping creation.");
    }

    // Create products
    // Define JSON schema for the users collection including new fields
    const productSchema = {
      $jsonSchema: {
        bsonType: "object",
        required: ["title", "summary", "price", "description", "imageUrl"],
        properties: {
          title: {
            bsonType: "string",
            description: "must be a string and is required"
          },
          summary: {
            bsonType: "string",
            description: "must be a string and is required"
          },
          price: {
            bsonType: "number",
            description: "must be a number and is required"
          },
          description: {
            bsonType: "string",
            description: "must be a string and is required"
          },
          imageUrl: {
            bsonType: "string",
            description: "must be a string and is required"
          },
        }
      }
    };

    const productOptions = {
      validator: schema,
      validationLevel: "strict",
      validationAction: "error"
    };

    // Check if collection exists
    const productCollections = await db.listCollections({ name: 'products' }).toArray();

    if (productCollections.length === 0) {
      await db.createCollection('products', productOptions);
      console.log(`Collection products' created with schema validation.`);
    } else {
      await db.command({
        collMod: 'products',
        validator: productSchema,
        validationLevel: "strict",
        validationAction: "error"
      });
      console.log(`Collection products schema validation updated.`);
    }

    const products = [
      {
        title: "Sharpee",
        summary: "Very sharp pokemon",
        price: 100,
        description: "A strong ground type pokemon"
      },
      {
        title: "Muffles",
        summary: "Very cuddly pokemon",
        price: 200,
        description: "A cuddly psychic type pokemon"
      },
      {
        title: "Hampton",
        summary: "Very fast pokemon",
        price: 150,
        description: "A fast flying type pokemon"
      },
    ]

    for (const productData of products) {
      const product = new Product({
        ...productData,
        imageUrl: generateRandomImageUrl(productData.title)
      });
      await product.save();
    }
  } catch (error) {
    console.error("Error deploying schema or creating admin user:", error);
  } finally {
    // await db.close();
  }
}

run();