const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const { NodeSSH } = require("node-ssh");

// 配置信息
const config = {
  host: "10.16.90.231",
  username: "cquptjsj",
  password: "duanxiaolin",
  remotePath: "/home/cquptjsj/Desktop/next", // 指定远程路径
};

const ssh = new NodeSSH();

// 压缩项目文件
async function createArchive() {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(path.join(__dirname, "dist.zip"));
    const archive = archiver("zip", {
      zlib: { level: 9 },
    });

    output.on("close", () => {
      console.log("📦 压缩包创建完成，大小:", archive.pointer() + " bytes");
      resolve();
    });

    archive.on("error", (err) => {
      reject(err);
    });

    archive.pipe(output);
    archive.directory(".next/", ".next");
    archive.directory("public/", "public");
    archive.file("package.json");
    archive.file("next.config.js");
    archive.finalize();
  });
}

// 清理远程目录（保留目录结构）
async function cleanRemoteDirectory() {
  console.log("🧹 清理远程目录内容...");

  // 删除目录内所有内容但保留目录本身
  await ssh.execCommand(`find ${config.remotePath} -mindepth 1 -delete`);
  console.log("✅ 远程目录内容已清理");
}

// 检查容器状态
async function checkContainerStatus() {
  console.log("🔍 检查容器状态...");
  const { stdout } = await ssh.execCommand(
    `docker ps -a --filter "name=next-app" --format "{{.Names}}"`
  );
  const containerName = stdout.trim();

  if (containerName !== "next-app") {
    throw new Error("容器未启动或不存在，请检查 Docker 配置和日志");
  }

  console.log("✅ 容器正在运行");
}

async function deploy() {
  try {
    // 1. 压缩文件
    // console.log('🔨 正在压缩项目文件...');
    // await createArchive();

    // 2. 连接到服务器
    console.log("🖥️ 正在连接服务器...");
    await ssh.connect(config);
    console.log("✅ 连接成功!");

    // 3. 确保目录存在并清理内容
    await ssh.execCommand(`mkdir -p ${config.remotePath}`);
    await cleanRemoteDirectory();

    // 4. 上传压缩文件
    console.log("🚀 正在上传文件...");
    await ssh
      .putFile(
        path.join(__dirname, "dist.zip"),
        `${config.remotePath}/dist.zip`
      )
      .then(() => {
        console.log("✅ 文件上传完成");
      })
      .catch((err) => {
        console.log("❌ 文件上传失败", err);
        process.exit(0);
      });

    // 5. 解压文件
    console.log("📂 正在解压文件...");
    await ssh.execCommand(`cd ${config.remotePath} && unzip -o dist.zip`);
    console.log("✅ 文件解压完成");

    // 6. 安装依赖
    console.log("📦 正在安装依赖...");
    await ssh.execCommand(
      `cd ${config.remotePath} && npm install --production`
    );
    console.log("✅ 依赖安装完成");

    // 7. Docker相关操作
    await setupDocker();

    // 8. 检查容器状态
    await checkContainerStatus();

    console.log("🎉 部署完成!");
  } catch (error) {
    console.error("❌ 部署失败:", error);
  } finally {
    // 清理本地压缩文件
    // if (fs.existsSync(path.join(__dirname, 'dist.zip'))) {
    //     fs.unlinkSync(path.join(__dirname, 'dist.zip'));
    // }
    ssh.dispose();
  }
}

// Docker相关设置
async function setupDocker() {
  console.log("🐳 正在设置Docker...");

  const dockerfileContent = `
FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --production
COPY . .
ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=http://10.16.90.231:8080
ENV NEXTAUTH_URL=http://10.16.90.231:3000
ENV NEXTAUTH_SECRET=Fo9xQccimowaBWbwqhR/4WRlMNPa7MsfpvMUzT+qozM=
EXPOSE 3000
CMD ["npm", "start"]
    `.trim();

  const dockerComposeContent = `
version: '3'
services:
  next-app:
    build: .
    ports:
      - "3000:3000"
    restart: always
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=http://10.16.90.231:8080
      - NEXTAUTH_URL=http://10.16.90.231:3000
      - NEXTAUTH_SECRET=Fo9xQccimowaBWbwqhR/4WRlMNPa7MsfpvMUzT+qozM=
    `.trim();

  // 创建临时文件
  const tempDockerfilePath = path.join(__dirname, "tempDockerfile");
  const tempDockerComposePath = path.join(__dirname, "tempDockerCompose.yml");

  fs.writeFileSync(tempDockerfilePath, dockerfileContent);
  fs.writeFileSync(tempDockerComposePath, dockerComposeContent);

  // 上传Docker配置文件
  await ssh.putFile(tempDockerfilePath, `${config.remotePath}/Dockerfile`);
  await ssh.putFile(
    tempDockerComposePath,
    `${config.remotePath}/docker-compose.yml`
  );
  console.log("✅ Docker配置文件上传完成");

  // 删除临时文件
  fs.unlinkSync(tempDockerfilePath);
  fs.unlinkSync(tempDockerComposePath);

  // 重建Docker容器
  console.log("🔨 重建Docker容器...");
  await ssh.execCommand(`
        cd ${config.remotePath} && 
        docker-compose down && 
        docker-compose up -d --build
    `);
  console.log("✅ Docker容器已重启");
}

// 运行部署
deploy();
