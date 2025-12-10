# Literaq Domain Setup Guide

## 🌐 Your Domain: literaq.com

### Vercel Deployment Setup

When you deploy to Vercel, you'll need to connect your domain:

1. **Deploy to Vercel**
   - Push your code to GitHub
   - Import the repo to Vercel
   - Deploy

2. **Add Custom Domain**
   - In your Vercel project, go to **Settings** → **Domains**
   - Add domain: `literaq.com`
   - Also add: `www.literaq.com`

3. **Update DNS Records**
   
   In your domain registrar (where you bought literaq.com), add these records:

   **For apex domain (literaq.com):**
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   ```

   **For www subdomain:**
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

4. **Update Environment Variables**
   
   Update these in Vercel:
   ```env
   NEXT_PUBLIC_APP_URL=https://literaq.com
   ```

   Also update in Clerk:
   - Add `literaq.com` to allowed domains
   - Update redirect URLs to use `literaq.com`

   And in Stripe:
   - Update webhook URL to `https://literaq.com/api/webhooks/stripe`

### SSL Certificate

Vercel automatically provisions an SSL certificate for your domain. This usually takes 1-2 minutes after DNS propagation.

### DNS Propagation

After adding DNS records, it can take up to 48 hours to propagate (usually much faster, 5-30 minutes).

Check propagation status at: https://dnschecker.org

### Testing

Once deployed and DNS is set up:
1. Visit `https://literaq.com`
2. Test sign up/sign in
3. Upload a paper
4. Test payment flow

## 🔐 Production Checklist

- [ ] Get production Clerk API keys
- [ ] Get production Stripe API keys  
- [ ] Create Stripe products with live mode
- [ ] Set up production webhook in Stripe
- [ ] Add all environment variables to Vercel
- [ ] Update `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Test everything in production
- [ ] Monitor logs and errors

## 📊 Post-Launch

- Set up error monitoring (Sentry)
- Set up analytics (Vercel Analytics, Google Analytics)
- Monitor Stripe dashboard for payments
- Monitor Clerk dashboard for user growth
- Check database usage in Neon dashboard

---

**Your Literaq MVP is ready to launch on literaq.com! 🚀**
