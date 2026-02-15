# Comprehensive Deployment Guide for AWS EC2 (Free Tier)

This detailed guide walks you through deploying **CredibilityCheckerRAG** on an AWS EC2 `t2.micro` instance (completely Free Tier eligible).

## Prerequisites
- An active **AWS Account** ([Sign up here](https://aws.amazon.com/free/)).
- Your **GitHub/GitLab Credentials** (Username and Personal Access Token or Password) ready for cloning.
- Your **Mistral/OpenAI API Keys** ready.

---

## Part 1: Launch an EC2 Instance (Virtual Server)
1.  **Log in** to the [AWS Management Console](https://console.aws.amazon.com/).
2.  In the search bar at the top, type `EC2` and select **EC2** from the results.
3.  On the EC2 Dashboard, click the orange **Launch instance** button.
4.  **Name and tags**:
    -   In the "Name" field, type: `CredibilityChecker-Server`
5.  **Application and OS Images (Amazon Machine Image)**:
    -   Select **Ubuntu**.
    -   Ensure "Free tier eligible" is listed under the version (e.g., *Ubuntu Server 22.04 LTS*). This is the safest default.
6.  **Instance type**:
    -   Select **t2.micro** (1 vCPU, 1 GiB Memory). This is Free Tier eligible.
7.  **Key pair (login)**:
    -   Click **Create new key pair**.
    -   **Key pair name**: `credibility-key`
    -   **Key pair type**: RSA
    -   **Private key file format**: `.pem` (for Mac/Linux/Powershell) or `.ppk` (for older PuTTY). `.pem` is recommended.
    -   Click **Create key pair**. The file will download automatically. **Keep this safe**; you cannot download it again.
8.  **Network settings**:
    -   **Firewall (security groups)**: Select "Create security group".
    -   Check **Allow SSH traffic from**. Ideally set to `My IP` for security, or `Anywhere (0.0.0.0/0)` for convenience.
    -   Check **Allow HTTP traffic from the internet**.
    -   Check **Allow HTTPS traffic from the internet**.
    -   *Crucial Step*: We need to open port 5000 (Flask default). We will do this **after** launch to be precise.
9.  **Configure storage**:
    -   Default is 8 GiB gp2/gp3. This is fine. You can increase to 20 GiB (Free Tier limit is 30GB total) if you want more space.
10. Click the orange **Launch instance** button on the right.
11. Click **View all instances** to see your new server initializing.

---

## Part 2: Configure Security Group (Open Port 5000)
By default, standard web ports (80/443) are open, but Flask runs on 5000.

1.  In the EC2 Dashboard -> **Instances**, check the box next to your `CredibilityChecker-Server`.
2.  Click the **Security** tab in the bottom pane.
3.  Click the link under **Security groups** (it looks like `sg-01234abcd...`).
4.  In the new window identifying the security group, click the **Inbound rules** tab.
5.  Click **Edit inbound rules**.
6.  Click **Add rule** (bottom left).
    -   **Type**: Select `Custom TCP`.
    -   **Port range**: Type `5000`.
    -   **Source**: Select `Anywhere-IPv4` (`0.0.0.0/0`).
    -   *Description (optional)*: "Flask App Port".
7.  Click **Save rules**.

---

## Part 3: Connect to your Instance
The easiest way is using the browser (no keys needed).

1.  Go back to **Instances**.
2.  Select your instance `CredibilityChecker-Server`.
3.  Click the **Connect** button (top right).
4.  Select the **EC2 Instance Connect** tab.
5.  Click **Connect**.
6.  A new browser tab will open with a black terminal screen. You are now "inside" your server!

---

## Part 4: Deploy the Code
Run these commands in the black terminal window.

### 1. Clone the Repository
Replace `<YOUR_REPO_URL>` with your actual repository URL.

*Note: If your repo is private, it will ask for `Username` and `Password`. For `Password`, you essentially need a GitHub [Personal Access Token](https://github.com/settings/tokens).*

```bash
# Example: git clone https://github.com/yourusername/CredibilityCheckerRAG.git
git clone <YOUR_REPO_URL>
```
Once cloned, move into the directory:
```bash
cd CredibilityCheckerRAG/v3
# OR whatever the folder name is. Type 'ls' to see the folder name.
# e.g., cd CredibilityCheckerRAG
```

### 2. Run the Setup Script
I have included a helper script to do all the heavy lifting (installing Python, creating a swap file to prevent crashing, setting up virtual environment).

```bash
# Make the script executable
chmod +x deploy_ec2.sh

# Run it
./deploy_ec2.sh
```
*Wait for this to finish. It may take 2-5 minutes.*

### 3. Setup Environment Variables (.env)
You need to create the `.env` file on the server.

1.  Open the text editor `nano`:
    ```bash
    nano .env
    ```
2.  Now, paste your API keys. (Right-click in the terminal window usually pastes).
    ```ini
    MISTRAL_API_KEY=your_actual_api_key_here
    # Add any other keys from your local .env
    ```
3.  **To Save and Exit nano**:
    -   Press `Ctrl + X` (to exit).
    -   Press `Y` (to say Yes to saving).
    -   Press `Enter` (to confirm the filename).

### 4. Start the Application
Run the start script created by the deploy script:

```bash
./start_app.sh
```
You should see output saying `[INFO] Starting gunicorn...` and `Listening at: http://0.0.0.0:5000`.

---

## Part 5: Access Your App
1.  Go back to the **AWS Console** -> **Instances**.
2.  Find your instance and look for **Public IPv4 address** (e.g., `54.123.45.67`).
3.  Open a new browser tab on your computer.
4.  Go to: `http://<YOUR_PUBLIC_IP>:5000`
    -   *Example*: `http://54.123.45.67:5000`

**Success!** You should see your application running.

---

## Troubleshooting

-   **"This site can't be reached"**:
    -   Did you mistakenly use `https://`? Make sure it is `http://` (unless you set up SSL).
    -   Did you do **Part 2 (Security Groups)** correctly? Verify Port 5000 is open to `0.0.0.0/0`.
-   **"MemoryError" or "Killed" during installation**:
    -   The `t2.micro` has only 1GB RAM. Ensure `./deploy_ec2.sh` ran successfully—it creates a "swap file" that acts as extra RAM.
-   **Deployment script permission denied**:
    -   Did you run `chmod +x deploy_ec2.sh`?
