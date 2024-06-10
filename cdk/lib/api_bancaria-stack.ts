import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';  // Importa Construct desde constructs
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class ApiBancariaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {  // Usa Construct aquí
    super(scope, id, props);

    // Crea una instancia de base de datos RDS MySQL
    const dbSecret = new secretsmanager.Secret(this, 'DBSecret', {
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          username: 'admin',
        }),
        excludePunctuation: true,
        includeSpace: false,
        generateStringKey: 'password'
      }
    });

    const dbInstance = new rds.DatabaseInstance(this, 'Database', {
      engine: rds.DatabaseInstanceEngine.mysql({ version: rds.MysqlEngineVersion.VER_8_0 }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE2, ec2.InstanceSize.MICRO),
      credentials: {
        username: 'admin',
        password: dbSecret.secretValue,
      },
      databaseName: 'api_bancaria',
      vpc: new ec2.Vpc(this, 'Vpc', { maxAzs: 2 }),
      deletionProtection: false,
    });

    // Define tus funciones Lambda y la API Gateway aquí
    const depositarLambda = new lambda.Function(this, 'DepositarLambda', {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'depositar.handler',
    });

    const retirarLambda = new lambda.Function(this, 'RetirarLambda', {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'retirar.handler',
    });

    const cambiarClaveLambda = new lambda.Function(this, 'CambiarClaveLambda', {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'cambiarClave.handler',
    });

    const api = new apigateway.RestApi(this, 'api-bancaria', {
      restApiName: 'API Bancaria',
      description: 'API para operaciones bancarias',
    });

    const depositar = api.root.addResource('depositar');
    const depositarIntegration = new apigateway.LambdaIntegration(depositarLambda);
    depositar.addMethod('POST', depositarIntegration);

    const retirar = api.root.addResource('retirar');
    const retirarIntegration = new apigateway.LambdaIntegration(retirarLambda);
    retirar.addMethod('POST', retirarIntegration);

    const cambiarClave = api.root.addResource('cambiar-clave');
    const cambiarClaveIntegration = new apigateway.LambdaIntegration(cambiarClaveLambda);
    cambiarClave.addMethod('POST', cambiarClaveIntegration);
  }
}

