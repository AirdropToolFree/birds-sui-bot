const fs = require('fs');
const path = require('path');
const axios = require('axios');
const colors = require('colors');
const readline = require('readline');
const { DateTime } = require('luxon');
const { HttpsProxyAgent } = require('https-proxy-agent');

class BirdX {
    constructor() {
        this.headers = {
            "Accept": "application/json, text/plain, */*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5",
            "Content-Type": "application/json",
            "Origin": "https://birdx.birds.dog",
            "Referer": "https://birdx.birds.dog/",
            "Sec-Ch-Ua": '"Not/A)Brand";v="99", "Google Chrome";v="115", "Chromium";v="115"',
            "Sec-Ch-Ua-Mobile": "?0",
            "Sec-Ch-Ua-Platform": '"Windows"',
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-site",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
        };
        this.proxyList = this.loadProxies();
    }

    loadProxies() {
        const proxyFile = path.join(__dirname, 'proxy.txt');
        return fs.readFileSync(proxyFile, 'utf8')
            .replace(/\r/g, '')
            .split('\n')
            .filter(Boolean);
    }

    async checkProxyIP(proxy) {
        try {
            const proxyAgent = new HttpsProxyAgent(proxy);
            const response = await axios.get('https://api.ipify.org?format=json', { httpsAgent: proxyAgent });
            if (response.status === 200) {
                return response.data.ip;
            } else {
                throw new Error(`Không thể kiểm tra IP của proxy. Status code: ${response.status}`);
            }
        } catch (error) {
            throw new Error(`Error khi kiểm tra IP của proxy: ${error.message}`);
        }
    }

    log(msg, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        switch(type) {
            case 'success':
                console.log(`[${timestamp}] [*] ${msg}`.green);
                break;
            case 'custom':
                console.log(`[${timestamp}] [*] ${msg}`.magenta);
                break;        
            case 'error':
                console.log(`[${timestamp}] [!] ${msg}`.red);
                break;
            case 'warning':
                console.log(`[${timestamp}] [*] ${msg}`.yellow);
                break;
            default:
                console.log(`[${timestamp}] [*] ${msg}`.blue);
        }
    }

    async countdown(seconds) {
        for (let i = seconds; i >= 0; i--) {
            readline.cursorTo(process.stdout, 0);
            process.stdout.write(`===== Chờ ${i} giây để tiếp tục vòng lặp =====`);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        this.log('', 'info');
    }

    async callAPI(telegramauth, proxy) {
        const url = "https://api.birds.dog/user";
        const headers = { 
            ...this.headers, 
            "Telegramauth": `tma ${telegramauth}`
        };
        const payload = {
            "name": JSON.parse(decodeURIComponent(telegramauth.split('user=')[1].split('&')[0])).first_name + " " + JSON.parse(decodeURIComponent(telegramauth.split('user=')[1].split('&')[0])).last_name,
            "referId": 376905749,
            "username": JSON.parse(decodeURIComponent(telegramauth.split('user=')[1].split('&')[0])).username
        };

        const proxyAgent = new HttpsProxyAgent(proxy);

        try {
            const getResponse = await axios.get(url, { headers, httpsAgent: proxyAgent });
            if (getResponse.data && getResponse.data.balance !== undefined) {
                this.log(`Đăng nhập thành công!`, 'success');
                this.log(`Balance: ${getResponse.data.balance}`, 'custom');
                return getResponse.data;
            } else {
                throw new Error("Tài khoản mới");
            }
        } catch (error) {
            this.log(`Đăng nhập không thành công, đăng kí tài khoản...`, 'warning');
            
            try {
                const postResponse = await axios.post(url, payload, { headers, httpsAgent: proxyAgent });
                if (postResponse.data && postResponse.data.balance !== undefined) {
                    this.log(`Đăng ký thành công!`, 'success');
                    this.log(`Balance: ${postResponse.data.balance}`, 'custom');
                    return postResponse.data;
                } else {
                    throw new Error("Không thể đăng kí tài khoản");
                }
            } catch (postError) {
                this.log(`Lỗi rồi: ${postError.message}`, 'error');
            }
        }

        this.log("Đăng nhập thất bại. chuyển tài khoản", 'error');
        return null;
    }

    async callWormMintAPI(telegramauth, proxy) {
        const statusUrl = "https://worm.birds.dog/worms/mint-status";
        const mintUrl = "https://worm.birds.dog/worms/mint";
        const headers = { 
            ...this.headers, 
            "Authorization": `tma ${telegramauth}`
        };
        const proxyAgent = new HttpsProxyAgent(proxy);

        try {
            const statusResponse = await axios.get(statusUrl, { headers, httpsAgent: proxyAgent });
            const statusData = statusResponse.data.data;

            if (statusData.status === "MINT_OPEN") {
                this.log("Nhìn thấy sâu, bắt nó...", 'info');
                
                const mintResponse = await axios.post(mintUrl, {}, { headers, httpsAgent: proxyAgent });
                const mintData = mintResponse.data.data;
                this.log(`Kết quả: ${mintResponse.data.message}`, 'custom');
                
                if (mintData && mintData.status === "WAITING") {
                    const nextMintTime = DateTime.fromISO(mintData.nextMintTime);
                    const formattedNextMintTime = nextMintTime.toLocaleString(DateTime.DATETIME_FULL);
                    this.log(`Lần bắt sâu tiếp theo: ${formattedNextMintTime}`, 'info');
                }
            } else if (statusData.status === "WAITING") {
                const nextMintTime = DateTime.fromISO(statusData.nextMintTime);
                const formattedNextMintTime = nextMintTime.toLocaleString(DateTime.DATETIME_FULL);
                this.log(`Không thấy con sâu nào, lần bắt tiếp theo: ${formattedNextMintTime}`, 'warning');
            } else {
                this.log(`Trạng thái: ${statusData.status}`, 'warning');
            }
        } catch (error) {
            this.log(`Lỗi rồi: ${error.message}`, 'error');
        }
    }

    async playEggMinigame(telegramauth, proxy) {
        const headers = { 
            ...this.headers, 
            "Telegramauth": `tma ${telegramauth}`
        };
        const proxyAgent = new HttpsProxyAgent(proxy);

        try {
            const joinResponse = await axios.get("https://api.birds.dog/minigame/egg/join", { headers, httpsAgent: proxyAgent });
            let { turn } = joinResponse.data;
            this.log(`Bắt đầu đập trứng: có ${turn} lượt`, 'info');

            const turnResponse = await axios.get("https://api.birds.dog/minigame/egg/turn", { headers, httpsAgent: proxyAgent });
            turn = turnResponse.data.turn;
            this.log(`Lượt hiện tại: ${turn}`, 'info');

            let totalReward = 0;

            while (turn > 0) {
                const playResponse = await axios.get("https://api.birds.dog/minigame/egg/play", { headers, httpsAgent: proxyAgent });
                const { result } = playResponse.data;
                turn = playResponse.data.turn;
                totalReward += result;
                this.log(`Còn ${turn} lần đập trứng | Phần thưởng ${result}`, 'custom');
            }

            const claimResponse = await axios.get("https://api.birds.dog/minigame/egg/claim", { headers, httpsAgent: proxyAgent });
            if (claimResponse.data === true) {
                this.log("Claim thành công!", 'success');
                this.log(`Tổng phần thưởng: ${totalReward}`, 'custom');
            } else {
                this.log("Claim thất bại", 'error');
            }
        } catch (error) {
            this.log(`Egg minigame error: ${error.message}`, 'error');
        }
    }

    async nangcap(telegramauth, balance, proxy) {
        const headers = { 
            ...this.headers, 
            "Telegramauth": `tma ${telegramauth}`
        };
        const proxyAgent = new HttpsProxyAgent(proxy);
    
        try {
            const infoResponse = await axios.get("https://api.birds.dog/minigame/incubate/info", { headers, httpsAgent: proxyAgent });
            let incubationInfo = infoResponse.data;
            this.log(`Cấp độ của trứng: ${incubationInfo.level}`, 'info');
    
            const currentTime = Date.now();
            const upgradeCompletionTime = incubationInfo.upgradedAt + (incubationInfo.duration * 60 * 60 * 1000);
    
            if (incubationInfo.status === "processing") {
                if (currentTime > upgradeCompletionTime) {
                    const confirmResponse = await axios.post("https://api.birds.dog/minigame/incubate/confirm-upgraded", {}, { headers, httpsAgent: proxyAgent });
                    if (confirmResponse.data === true) {
                        this.log("Hoàn thành nâng cấp", 'success');
                        const updatedInfoResponse = await axios.get("https://api.birds.dog/minigame/incubate/info", { headers, httpsAgent: proxyAgent });
                        incubationInfo = updatedInfoResponse.data;
                    } else {
                        this.log("Xác nhận nâng cấp thất bại", 'error');
                    }
                } else {
                    const remainingTime = Math.ceil((upgradeCompletionTime - currentTime) / (60 * 1000));
                    this.log(`Đang trong quá trình nâng cấp. Thời gian còn lại: ${remainingTime} phút`, 'info');
                    return;
                }
            }
    
            if (incubationInfo.status === "confirmed" && incubationInfo.nextLevel) {
                if (balance >= incubationInfo.nextLevel.birds) {
                    await this.upgradeEgg(headers, proxyAgent);
                } else {
                    this.log(`Không đủ birds để nâng cấp. Cần ${incubationInfo.nextLevel.birds} birds`, 'warning');
                }
            } else if (incubationInfo.status === "confirmed") {
                this.log("Đã đạt cấp độ tối đa", 'info');
            }
        } catch (error) {
            if (error.response && error.response.status === 400 && error.response.data === 'Start incubating your egg now') {
                this.log("Bắt đầu ấp trứng ngay bây giờ.", 'warning');
                await this.upgradeEgg(headers, proxyAgent);
            } else {
                this.log(`Lỗi nâng cấp trứng: ${error.message}`, 'error');
            }
        }
    }
    
    async upgradeEgg(headers, proxyAgent) {
        try {
            const upgradeResponse = await axios.get("https://api.birds.dog/minigame/incubate/upgrade", { headers, httpsAgent: proxyAgent });
            const upgradeInfo = upgradeResponse.data;
            const upgradeCompletionTime = upgradeInfo.upgradedAt + (upgradeInfo.duration * 60 * 60 * 1000);
            const completionDateTime = new Date(upgradeCompletionTime);
            this.log(`Bắt đầu nâng cấp lên level ${upgradeInfo.level}. Hoàn thành lúc: ${completionDateTime.toLocaleString()}`, 'success');
        } catch (error) {
            this.log(`Lỗi khi nâng cấp trứng: ${error.message}`, 'error');
        }
    }

    async performTasks(telegramauth, proxy) {
        const headers = { 
            ...this.headers, 
            "Telegramauth": `tma ${telegramauth}`
        };
        const proxyAgent = new HttpsProxyAgent(proxy);

        try {
            const projectResponse = await axios.get("https://api.birds.dog/project", { headers, httpsAgent: proxyAgent });
            const allTasks = projectResponse.data.flatMap(project => project.tasks);
            
            const userTasksResponse = await axios.get("https://api.birds.dog/user-join-task", { headers, httpsAgent: proxyAgent });
            const completedTaskIds = userTasksResponse.data.map(task => task.taskId);

            const incompleteTasks = allTasks.filter(task => !completedTaskIds.includes(task._id));

            for (const task of incompleteTasks) {
                try {
                    const payload = {
                        taskId: task._id,
                        channelId: task.channelId || "",
                        slug: task.slug || "none",
                        point: task.point
                    };

                    const joinTaskResponse = await axios.post("https://api.birds.dog/project/join-task", payload, { headers, httpsAgent: proxyAgent });
                    
                    if (joinTaskResponse.data.msg === "Successfully") {
                        this.log(`Làm nhiệm vụ ${task.title} thành công | phần thưởng: ${task.point}`, 'success');
                    } else {
                        this.log(`Làm nhiệm vụ ${task.title} thất bại`, 'error');
                    }
                } catch (error) {
                    // this.log(`Lỗi khi thực hiện nhiệm vụ ${task.title}: ${error.message}`, 'error');
                }

                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            if (incompleteTasks.length === 0) {
                this.log("Tất cả nhiệm vụ đã hoàn thành", 'info');
            }
        } catch (error) {
            this.log(`Lỗi khi thực hiện các nhiệm vụ: ${error.message}`, 'error');
        }
    }

    askQuestion(query) {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        return new Promise(resolve => rl.question(query, ans => {
            rl.close();
            resolve(ans);
        }))
    }

    async checkAndJoinGuild(telegramauth, proxy) {
        const headers = { 
            ...this.headers, 
            "Telegramauth": `tma ${telegramauth}`
        };
        const proxyAgent = new HttpsProxyAgent(proxy);
        
        try {
            const guildStatusResponse = await axios.get("https://api.birds.dog/guild/me", { 
                headers, 
                httpsAgent: proxyAgent 
            });
            
            if (guildStatusResponse.data === null) {
                try {
                    const joinResponse = await axios.get("https://api.birds.dog/guild/join/67198910d6afd34638ff1718", {
                        headers,
                        httpsAgent: proxyAgent
                    });
                    
                    if (joinResponse.data === "ok") {
                        this.log("Gia nhập thành công guild", 'success');
                    }
                } catch (joinError) {
                    this.log(`Không thể gia nhập guild: ${joinError.message}`, 'error');
                }
            } else {
                const guildData = guildStatusResponse.data;
                if (guildData.guild._id === "67198910d6afd34638ff1718") {
                    this.log(`Bạn đã gia nhập guild ${guildData.guild.name}`, 'info');
                    this.log(`Số Bird trong guild: ${guildData.guild.bird}`, 'custom');
                    this.log(`Bird có thể claim: ${guildData.guild.claimable}`, 'custom');
                } else {
                    this.log(`Bạn đang ở trong guild khác: ${guildData.guild.name}`, 'warning');
                }
            }
        } catch (error) {
            this.log(`Lỗi kiểm tra guild: ${error.message}`, 'error');
        }
    }

    async main() {
        const dataFile = path.join(__dirname, 'data.txt');
        const data = fs.readFileSync(dataFile, 'utf8')
            .replace(/\r/g, '')
            .split('\n')
            .filter(Boolean);

        const nangcapt = await this.askQuestion('Bạn có muốn nâng cấp không? (y/n): ');
        const hoinangcapt = nangcapt.toLowerCase() === 'y';

        const nhiemvu = await this.askQuestion('Bạn có muốn làm nhiệm vụ không? (y/n): ');
        const hoinhiemvu = nhiemvu.toLowerCase() === 'y';

        while (true) {
            for (let i = 0; i < data.length; i++) {
                const telegramauth = data[i];
                const userData = JSON.parse(decodeURIComponent(telegramauth.split('user=')[1].split('&')[0]));
                const userId = userData.id;
                const firstName = userData.first_name;
                const proxy = this.proxyList[i % this.proxyList.length];

                let proxyIP = 'Unknown';
                try {
                    proxyIP = await this.checkProxyIP(proxy);
                } catch (error) {
                    this.log(`Không thể kiểm tra IP của proxy: ${error.message}`, 'warning');
                    continue;
                }

                console.log(`========== Tài khoản ${i + 1} | ${firstName.green} | ip: ${proxyIP} ==========`);
                
                const apiResult = await this.callAPI(telegramauth, proxy);
                if (apiResult) {
                    const balance = apiResult.balance;
                    await this.checkAndJoinGuild(telegramauth, proxy);
                    await this.callWormMintAPI(telegramauth, proxy);
                    await this.playEggMinigame(telegramauth, proxy);
                    if (hoinangcapt) {
                        this.log(`Bắt đầu kiểm tra và nâng cấp trứng...`, 'info');
                        await this.nangcap(telegramauth, balance, proxy);
                    }
                    if (hoinhiemvu) {
                        this.log(`Bắt đầu thực hiện các nhiệm vụ...`, 'info');
                        await this.performTasks(telegramauth, proxy);
                    }
                } else {
                    this.log(`API call thất bại cho tài khoản ${userId}. Bỏ qua tài khoản này.`, 'error');
                }

                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            await this.countdown(20 * 60);
        }
    }
}

const client = new BirdX();
client.main().catch(err => {
    client.log(err.message, 'error');
    process.exit(1);
});