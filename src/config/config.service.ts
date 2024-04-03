/* eslint-disable prettier/prettier */
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

class ConfigService {
  constructor(private env: { [k: string]: string | undefined }) {}

  /**
   * @returns the value of the environment variable with the given key
   */
  public getValue(key: string, throwOnMissing = true): string {
    const value = this.env[key.toUpperCase()] || this.env[key.toLowerCase()];
    if (!value && throwOnMissing) {
      throw new Error(`config error - missing env.${key}`);
    }
    return value;
  }

  public getPort() {
    return this.getValue('PORT', true);
  }

  public getJwtConfig() {
    return {
      secret: this.getValue('JWT_SECRET'),
      signOptions: {
        expiresIn: this.getValue('JWT_EXPIRES_IN'),
      },
    };
  }
}

const configService = new ConfigService(process.env);
export { configService };
