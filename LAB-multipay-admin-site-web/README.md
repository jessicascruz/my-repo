[![Build status](https://gitlab.com/grupomulti/multipay-admin-site-web/badges/main/pipeline.svg)](https://gitlab.com/multitechbr/adm/multipay/multipay-admin-site-web/-/commits/master?ref_type=HEADS)

# Multipay Admin Site Web

The purpose of this system is to provide a tool for tracking pending payments

## Architecture

Clean Architecture with DDD

### Project Structure
```
src/
├── app/          # Next.js routes and pages
├── domain/       # Business logic
├── infra/        # Infrastructure configurations
├── presentation/ # UI components
└── @types/       # TypeScript definitions
```

### Monitoring
- Datadog for logs and metrics
- AppSec and IAST enabled
- Profiling and runtime metrics configured

## Environments

### Production
- URL: `https://multipay.grupomulti.com.br`

### Development
- URL: `https://multipay.qa.grupomulti.com.br`

## Security

- Authentication via Multi SSO
- AppSec and IAST enabled
- Centralized logs
- Security monitoring
- SSL/TLS certificates

## Monitoring

### Datadog
- Application logs
- Runtime metrics
- Performance profiling
- AppSec and IAST
- Infrastructure monitoring

## Scalability

- HPA (Horizontal Pod Autoscaling) configured
- Minimum: 2 replicas
- Maximum: 5 replicas
- Scaling based on CPU and memory

## Support

For technical support or questions, please contact the development team via email: suporte@multipay.com.br

## Unit Testing
Run the command:
```sh
    yarn test
```

## Swagger
- Gateway Link: `https://multipay-gateway-api.k8s-qa-multi.com.br/`
- API Link: `https://multipay-api.qa.grupomulti.com.br/index.html`

## ENDPOINTS
- QA: `https://multipay.grupomulti.com.br`
- PROD: `https://multipay.qa.grupomulti.com.br`

Context: MULTIPAY

## To run locally
Run the command:
``` sh
    yarn dev
```

