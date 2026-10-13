# What's My IP

Android app for [ip.sprytnyk.dev](https://ip.sprytnyk.dev), with the same design as the site. It shows your
public IPv4 and IPv6 addresses, country, city and network organisation, and can look up any
other address.

The API host is set in `src/lib/api.ts`. The backend lives at
[sprytnyk/ip](https://github.com/sprytnyk/ip).

## Develop

```bash
npm install        # also installs the git hooks (husky)
npx expo start     # scan the QR code with Expo Go on Android
```

## Checks

```bash
npm run lint       # ESLint (eslint-config-expo) + Prettier
npm run typecheck  # tsc --noEmit
npm run format     # Prettier --write
```

The pre-commit hook runs lint-staged: `eslint --fix` and Prettier on staged files, then a
project-wide `tsc --noEmit`.
