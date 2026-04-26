# GitHub Secrets Configuration

This document describes the secrets needed for CI/CD pipelines to work properly.

## Required Secrets for GitHub Actions

Add these secrets to your GitHub repository:

### Deployment Secrets

```
DEPLOY_KEY              - SSH private key for deployment server (create with ssh-keygen)
DEPLOY_USER             - Username for deployment server (e.g., deploy)
DEPLOY_HOST_STAGING     - IP or hostname of staging server
DEPLOY_HOST_PROD        - IP or hostname of production server
DEPLOY_PATH_STAGING     - Full path on staging server (e.g., /app/project-estimator)
DEPLOY_PATH_PROD        - Full path on production server
```

### Notifications

```
SLACK_WEBHOOK           - Slack webhook URL for deployment notifications
                         (Get from: Slack Workspace > Settings > Incoming Webhooks)
```

### Container Registry

```
REGISTRY_USERNAME       - Docker registry username (if using private registry)
REGISTRY_PASSWORD       - Docker registry password
REGISTRY_URL            - Docker registry URL (e.g., ghcr.io)
```

### Additional Services (Optional)

```
SENTRY_DSN              - Sentry error tracking URL
SNYK_TOKEN              - Snyk security scanning token
CODECOV_TOKEN           - Codecov integration token
```

## Step-by-Step Setup

### 1. Generate SSH Deployment Key

```bash
# Generate new SSH key (without passphrase)
ssh-keygen -t rsa -b 4096 -f deploy_key -N ""

# Add public key to server
ssh-copy-id -i deploy_key.pub deploy@staging-server

# Convert private key and add to GitHub Secrets
cat deploy_key  # Copy entire content

# Delete local keys after adding to GitHub
rm deploy_key deploy_key.pub
```

### 2. Add Secrets to GitHub

1. Go to: Repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add each secret with its name and value
4. For `DEPLOY_KEY`, paste the entire private key content

### 3. Verify Configuration

```bash
# Check that deployment keys work
ssh -i deploy_key deploy@your-staging-server "echo 'Success!'"
```

## Workflow Files Requiring Secrets

### test.yml
- ✅ No secrets required
- Uses: GITHUB_TOKEN (automatic)

### build.yml
- ✅ No secrets required
- Uses: GITHUB_TOKEN (automatic)
- Builds Docker images and scans for vulnerabilities

### deploy.yml
- ✅ Requires: `DEPLOY_KEY`, `DEPLOY_USER`, `DEPLOY_HOST_STAGING`, `DEPLOY_HOST_PROD`, `DEPLOY_PATH_STAGING`, `DEPLOY_PATH_PROD`
- Optional: `SLACK_WEBHOOK`

## Environment Variables for Deployment

The following environment variables are also needed on deployment servers:

### .env (Staging)
```
NODE_ENV=staging
DB_PASSWORD=<secure-staging-password>
JWT_SECRET=<secure-staging-secret>
API_KEY=<secure-staging-api-key>
REDIS_PASSWORD=<secure-staging-password>
LOG_LEVEL=debug
```

### .env (Production)
```
NODE_ENV=production
DB_PASSWORD=<secure-production-password>
JWT_SECRET=<secure-production-secret>
API_KEY=<secure-production-api-key>
REDIS_PASSWORD=<secure-production-password>
LOG_LEVEL=warn
SENTRY_DSN=<sentry-url>
```

## Testing Secrets Access

To test if workflows can access secrets:

1. Trigger a test workflow manually
2. Check the workflow run logs
3. If secrets are not accessible, you'll see warnings

## Secret Rotation

### Monthly Rotation Checklist

- [ ] SSH Deploy Keys
- [ ] API Keys
- [ ] JWT Secret
- [ ] Database Password
- [ ] Redis Password
- [ ] Slack Webhook URL (if changed)

### Rotation Procedure

1. Generate new secret/key
2. Update on deployment servers
3. Update in GitHub Secrets
4. Test deployment process
5. Remove old secret from servers
6. Log the change

## Security Best Practices

1. **Never commit secrets** to the repository
2. **Use `secrets.SECRET_NAME`** in workflows (automatically masked in logs)
3. **Limit secret access** to specific workflows/branches
4. **Rotate secrets regularly** (monthly recommended)
5. **Audit secret usage** in workflow logs
6. **Use branch protections** to prevent unauthorized deployments
7. **Enable 2FA** on GitHub account
8. **Review deploy logs** for suspicious activities

## Troubleshooting

### Secret Not Found Error

```
Error: Secrets.MY_SECRET is not defined
```

**Solution**: 
- Verify secret name matches exactly (case-sensitive)
- Ensure secret is added to the correct repository
- Clear browser cache and refresh

### Deployment Fails with Permission Denied

```
Permission denied (publickey)
```

**Solution**:
- Verify SSH public key is added to deployment server: `~/.ssh/authorized_keys`
- Check file permissions: `chmod 600 ~/.ssh/authorized_keys`
- Test SSH key: `ssh -i deploy_key deploy@server`

### Slack Notification Not Working

```
Error posting to Slack webhook
```

**Solution**:
- Verify webhook URL is correct
- Check webhook is active in Slack workspace
- Ensure message format is valid JSON

## Resources

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [GitHub Actions Best Practices](https://docs.github.com/en/actions/guides)
- [Slack Webhooks](https://api.slack.com/messaging/webhooks)
- [Docker Registry Authentication](https://docs.docker.com/docker-hub/access-tokens/)

---

**Last Updated**: 2024
**Status**: Required before production deployment
