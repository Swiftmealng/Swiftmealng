# Install Test Dependencies

## Client Dependencies

Run the following command in the `client` directory:

```bash
cd client
npm install -D vitest@latest \
  @vitest/ui@latest \
  @testing-library/react@latest \
  @testing-library/jest-dom@latest \
  @testing-library/user-event@latest \
  jsdom@latest \
  happy-dom@latest
```

## Server Dependencies

Server test dependencies are already installed. If needed:

```bash
cd server
npm install -D jest@latest \
  ts-jest@latest \
  @types/jest@latest \
  supertest@latest \
  @types/supertest@latest
```

## Update package.json Scripts

### Client (client/package.json)

Add these scripts to the `"scripts"` section:

```json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage",
  "test:ui": "vitest --ui"
}
```

### Server (server/package.json)

These scripts should already exist:

```json
"scripts": {
  "test": "jest --coverage",
  "test:watch": "jest --watch"
}
```

## Verify Installation

### Test Server
```bash
cd server
npm test
```

Expected: All tests pass ✓

### Test Client
```bash
cd client
npm test
```

Expected: All tests pass ✓

## Troubleshooting

If you encounter issues:

1. **Clear node_modules and reinstall**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Check Node version** (requires Node 16+):
   ```bash
   node --version
   ```

3. **Verify TypeScript** (server):
   ```bash
   npx tsc --version
   ```

4. **Check for peer dependency warnings**:
   ```bash
   npm install --legacy-peer-deps
   ```