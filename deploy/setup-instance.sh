#!/bin/bash
# =============================================================================
# Oracle Cloud Instance Initial Setup Script
# =============================================================================
# 
# Run this script ONCE on a fresh Oracle Cloud instance.
# Tested on: Ubuntu 22.04 (ARM64 Ampere A1)
#
# Usage: bash setup-instance.sh
# =============================================================================

set -e

echo "🚀 Starting Oracle Cloud Instance Setup..."

# -----------------------------------------------------------------------------
# 1. Update system packages
# -----------------------------------------------------------------------------
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# -----------------------------------------------------------------------------
# 2. Install Docker
# -----------------------------------------------------------------------------
echo "🐳 Installing Docker..."

# Remove old versions if any
sudo apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

# Install prerequisites
sudo apt install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Set up the repository (ARM64)
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add current user to docker group (no sudo needed for docker commands)
sudo usermod -aG docker $USER

echo "✅ Docker installed successfully!"

# -----------------------------------------------------------------------------
# 3. Install Caddy
# -----------------------------------------------------------------------------
echo "🔒 Installing Caddy..."

sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install -y caddy

echo "✅ Caddy installed successfully!"

# -----------------------------------------------------------------------------
# 4. Configure firewall (iptables)
# -----------------------------------------------------------------------------
echo "🔥 Configuring firewall rules..."

# Allow HTTP and HTTPS
sudo iptables -I INPUT -p tcp -m tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT -p tcp -m tcp --dport 443 -j ACCEPT

# Save iptables rules
sudo apt install -y iptables-persistent
sudo netfilter-persistent save

echo "✅ Firewall configured!"

# -----------------------------------------------------------------------------
# 5. Create log directory for Caddy
# -----------------------------------------------------------------------------
echo "📁 Creating directories..."
sudo mkdir -p /var/log/caddy
sudo chown caddy:caddy /var/log/caddy

# -----------------------------------------------------------------------------
# 6. Setup Caddyfile
# -----------------------------------------------------------------------------
echo "📝 Setting up Caddyfile..."

cat << 'EOF' | sudo tee /etc/caddy/Caddyfile
# API subdomain
api.lolog.site {
    reverse_proxy localhost:3000 {
        health_uri /health
        health_interval 30s
        health_timeout 5s
        
        header_up Host {host}
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {remote_host}
        header_up X-Forwarded-Proto {scheme}
    }
    
    header {
        Strict-Transport-Security "max-age=15768000; includeSubDomains"
        X-Frame-Options "DENY"
        X-Content-Type-Options "nosniff"
        X-XSS-Protection "1; mode=block"
        Referrer-Policy "strict-origin-when-cross-origin"
        -Server
    }
    
    log {
        output file /var/log/caddy/api.lolog.site.log {
            roll_size 10mb
            roll_keep 5
        }
    }
}
EOF

# Validate and reload Caddy
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy

echo "✅ Caddyfile configured!"

# -----------------------------------------------------------------------------
# 7. Enable services to start on boot
# -----------------------------------------------------------------------------
echo "🔄 Enabling services..."
sudo systemctl enable docker
sudo systemctl enable caddy

# -----------------------------------------------------------------------------
# Done!
# -----------------------------------------------------------------------------
echo ""
echo "=============================================="
echo "✅ Setup complete!"
echo "=============================================="
echo ""
echo "⚠️  IMPORTANT: Log out and log back in for Docker group changes to take effect."
echo ""
echo "Next steps:"
echo "1. Configure DNS: Point 'api.lolog.site' to this instance's public IP"
echo "2. Set up GitHub Secrets (see README for required secrets)"
echo "3. Push to 'main' branch to trigger deployment"
echo ""
echo "Useful commands:"
echo "  - Check Docker: docker ps"
echo "  - Check Caddy: sudo systemctl status caddy"
echo "  - View API logs: docker logs lolog-api"
echo "  - View Caddy logs: sudo tail -f /var/log/caddy/api.lolog.site.log"
echo ""
