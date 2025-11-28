/**
 * Swagger API Documentation Configuration
 */

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Library Management API',
      version: '1.0.0',
      description: 'API documentation for Library Management System with OCR functionality',
      contact: {
        name: 'API Support',
        email: 'support@library.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            name: { type: 'string', example: 'John Doe' },
            role: { type: 'string', enum: ['admin', 'user'], example: 'user' },
            phone: { type: 'string', example: '0123456789' },
            address: { type: 'string', example: 'Ha Noi, Vietnam' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        Book: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            title: { type: 'string', example: 'Clean Code' },
            isbn: { type: 'string', example: '9780132350884' },
            publisher: { type: 'string', example: 'Prentice Hall' },
            year_published: { type: 'integer', example: 2008 },
            description: { type: 'string', example: 'A handbook of agile software craftsmanship' },
            authors: { 
              type: 'array', 
              items: { type: 'string' },
              example: ['Robert C. Martin']
            },
            cover_front_url: { type: 'string', format: 'uri' },
            cover_inner_url: { type: 'string', format: 'uri' },
            cover_back_url: { type: 'string', format: 'uri' },
            status: { type: 'string', enum: ['draft', 'published'], example: 'published' },
            approval_status: { type: 'string', enum: ['pending', 'approved', 'rejected'], example: 'approved' },
            created_by: { type: 'string', example: '507f1f77bcf86cd799439011' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        Role: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            name: { type: 'string', enum: ['admin', 'user'], example: 'user' },
            permissions: { 
              type: 'object',
              properties: {
                can_manage_books: { type: 'boolean' },
                can_delete: { type: 'boolean' },
                can_approve: { type: 'boolean' }
              }
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Error message' },
            details: { 
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' }
                }
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./routes/*.js', './controllers/*.js'] // Path to the API routes
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Library API Documentation'
  }));
  
  // JSON endpoint
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log('📚 Swagger docs available at: http://localhost:3000/api-docs');
};

module.exports = { setupSwagger };
