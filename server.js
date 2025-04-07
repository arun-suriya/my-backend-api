const express = require("express");
const app = express();
// const mysql = require("mysql");
// const ADODB = require("node-adodb");
const cors = require("cors");
const path = require("path");
const { exec } = require('child_process')
// const { networkInterfaces } = require("os");
// const macaddress = require("macaddress");
const si = require("systeminformation");
// const crypto = require("crypto"); // To generate UUID
require("dotenv").config();

// const host = "172.23.0.164";
// const host = "localhost";
const host = "172.23.0.104";
const PORT = process.env.PORT || 8082;

const sql = require("mssql");

app.use(cors());
app.use(express.json());


const sqlite3 = require('sqlite3').verbose();

// Create or Open DB file
const db = new sqlite3.Database('./mydb.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database');
    }
});

db.run(`CREATE TABLE IF NOT EXISTS SupplierTable(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    UserName TEXT NOT NULL,
    Password TEXT NOT NULL,
    MacAddress TEXT NOT NULL,
    Status TEXT NOT NULL
)`);

app.get('/users', (req, res) => {
    db.all(`SELECT * FROM SupplierTable`, [], (err, rows) => {
        if (err) return res.status(500).send(err.message);
        res.json(rows);
    });
});

app.post('/add_new_supplier', (req, res) => {
    // const { name, email } = req.body;
    const postData = req.body;
    db.run(`INSERT INTO SupplierTable(UserName, Password,MacAddress,Status) VALUES(?, ?,?,?)`, [postData.username, postData.password, postData.macAddress, postData.status], (err) => {
        if (err) return res.status(500).send(err.message);
        res.send('User added successfully');
    });
});



// biome-ignore lint/style/noVar: <explanation>
// var config = {
//     "user": "sa", // Database username
//     "password": "Cadopt@1234", // Database password
//     "server": "192.168.0.106", // Server IP address
//     "database": "PRICOL_DB", // Database name
//     "options": {
//         "encrypt": false // Disable encryption
//     }
// }
// DB Configuration
const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    server: process.env.DB_HOST,
    database: process.env.DB_NAME,
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

// Connect to SQL Server
sql.connect(config, err => {
    if (err) {
        throw err;
    }
    console.log("Connection Successful!");
});

// Example API
app.get('/', (req, res) => {
    res.send('Backend API Working Successfully!');
});

// Vendor Details
app.post("/add_new_supplier", (request, response) => {
    const postData = request.body;

    // biome-ignore lint/style/useTemplate: <explanation>
    new sql.Request().query("INSERT INTO [dbo].[SupplierTable] (UserName,Password,MacAddress,Status)VALUES('" + postData.username + "','" + postData.password + "','" + postData.macAddress + "','" + postData.status + "') ").then(data => {
        // console.log("success");
        response.send(data);
    })
        .catch((error) => {
            console.error(error);
        });
});

app.post("/update_old_Supplier", (request, response) => {
    const postData = request.body;

    // biome-ignore lint/style/useTemplate: <explanation>
    new sql.Request().query("UPDATE [dbo].[SupplierTable] SET Password = '" + postData.password + "',MacAddress = '" + postData.macAddress + "',Status = '" + postData.status + "' ").then(data => {
        // console.log("success");
        response.send(data);
    })
        .catch((error) => {
            console.error(error);
        });
});

// biome-ignore lint/complexity/useArrowFunction: <explanation>
app.get('/get_Supplier_details/:username', function (request, response) {
    // biome-ignore lint/style/noVar: <explanation>
    var username = request.params.username;
    // biome-ignore lint/correctness/noConstAssign: <explanation>
    username = username.replace(':', '')
    // console.log(username)
    // biome-ignore lint/style/useTemplate: <explanation>
    new sql.Request().query("select * from [dbo].[SupplierTable]  where UserName= '" + username + "' ")
        .then(data => {
            // console.log(data)
            response.send(data.recordset);
        })
        .catch(error => {
            console.error(error);
        });
})

// Serve the ZIP file
app.get("/download", (req, res) => {
    const filePath = path.join(__dirname, "files", "Sample.zip");  // Replace with your ZIP file path
    res.download(filePath, "Sample.zip", (err) => {
        if (err) {
            console.error("Error sending file:", err);
            res.status(500).send("Error downloading the file");
        }
    });
});

app.get("/download11", (req, res) => {
    const filePath = path.join(__dirname, "", "notepad.exe");  // Replace with your ZIP file path
    res.download(filePath, "downloaded.zip", (err) => {
        if (err) {
            console.error("Error sending file:", err);
            res.status(500).send("Error downloading the file");
        }
    });
    exec(`"${filePath}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Execution error: ${error.message}`);
            return res.status(500).send("Error executing file");
        }
        if (stderr) {
            console.error(`Execution stderr: ${stderr}`);
        }
        console.log(`Execution stdout: ${stdout}`);
        res.send("EXE executed successfully");
    });
});

// app.get("/", (request, response) => {
//     // Execute a SELECT query
//     new sql.Request().query("SELECT * FROM [dbo].[User]", (err, result) => {
//         if (err) {
//             console.error("Error executing query:", err);
//         } else {
//             response.send(result.recordset); // Send query result as response
//             console.dir(result.recordset);
//         }
//     });
// });

// app.post("/trigger-jar", (req, res) => {
//     const postData = req.body;
//     const jarpath = "E:\\FirstApp.jar";
//     const command = `java -jar ${jarpath}`;
//     exec(command, (error, stdout, stderr) => {
//         if (error) {
//             console.error(`Error :  ${error.message}`)
//         }
//         console.log("Jar File Success running")
//     })
//     res.send("Success...")
// })

//-----------------------------------My SQL
// // biome-ignore lint/style/noVar: <explanation>
// var con = mysql.createConnection({
//     host: "3306",
//     user: "root",
//     password: "Mahi@160504"
//   });

//   // biome-ignore lint/complexity/useArrowFunction: <explanation>
//     con.connect(function(err) {
//     if (err) throw err;
//     console.log("Connected!");
//   })

//------------------------------------Access DB
// const connection1 = ADODB.open('Provider=Microsoft.Jet.OLEDB.4.0;Data Source=E:/application/application/server/Testing.mdb;');

// app.get('/', (req, res) => {
//   res.send(__dirname);
// });

// app.use(cors());
// app.use(express.json());

// app.post("/UpdateUserData", (req, res) => {
// 	// biome-ignore lint/style/noVar: <explanation>
// 	var postData = req.body;
//   // biome-ignore lint/style/useTemplate: <explanation>
//   console.log("first name ----> "+postData.FirstName);
//   // biome-ignore lint/style/useTemplate: <explanation>
//   console.log("second name ----> "+postData.LastName);

// 	connection1
// 		.execute(
// 			// biome-ignore lint/style/useTemplate: <explanation>
// 			"INSERT INTO User_Tables(First_Name,Last_Name) values('" +
// 				postData.FirstName +
// 				"','" +
// 				postData.LastName +
// 				"')",
// 		)
// 		.then((results) => {
// 			res.send("Success");
// 		})
// 		.catch((error) => {
// 			console.log("Error:  ", error);
// 		});
// });








// //Get- Mac Address
// // Function to Get MAC Address Based on User IP
// const getMacAddress = (ip) => {
//     const nets = networkInterfaces();
//     for (const netInterface of Object.values(nets)) {
//         for (const net of netInterface) {
//             if (net.address === ip) {
//                 return net.mac; // Return the MAC address
//             }
//         }
//     }
//     return "Unknown MAC Address";
// };

// // API Endpoint to Get User's MAC Address
// app.get("/get-mac", (req, res) => {
//     // const requestIp = require("request-ip");
//     // const { networkInterfaces } = require("os");
//     // const clientIp = requestIp.getClientIp(req); // Get Client IP
//     const clientIp = req.ip; // Get Client IP
//     console.log("🌍 Client IP:", clientIp);

//     const macAddress = getMacAddress(clientIp);
//     console.log("🔍 Client MAC Address:", macAddress);

//     res.json({ ip: clientIp, mac: macAddress });
// });






// Store MAC Address in Database
// Route to Get System UUID (Unique Identifier)
app.get("/get-unique-id", async (req, res) => {
    // let macAddress = null;

    // // Run the 'ipconfig /all' command on Windows
    // exec('ipconfig /all', (error, stdout, stderr) => {
    //     if (error) {
    //         console.error(`exec error: ${error}`);
    //         return res.status(500).send('Failed to fetch MAC address');
    //     }

    //     const sections = stdout.split('\n');
    //     let boolvalue = false;
    //     let arraylistofmac = [];

    //     for (const section of sections) {
    //         if (section.includes('Ethernet adapter Ethernet:')) {
    //             boolvalue = true;
    //         }
    //         if (section.includes('Physical Address.') && boolvalue) {
    //             arraylistofmac.push(section);
    //             break;
    //         }
    //     }

    //     if (arraylistofmac.length > 0) {
    //         const parts = arraylistofmac[0].split(':');
    //         const macadd = parts[1].trim();  // Removed unnecessary \r
    //         macAddress = macadd;
    //         console.log("MAC Address Found:", macAddress);
    //     } else {
    //         console.log("MAC Address not found for Ethernet adapter Ethernet");
    //         return res.status(404).send('MAC Address not found');
    //     }

    //     // Send the MAC address back to the frontend
    //     res.json({ uuid: macAddress });
    // });

    try {
        const systemInfo = await si.system();
        const uniqueId = systemInfo.uuid; // Unique hardware-based identifier
        console.log("✅ System UUID:", uniqueId);
        res.json({ uuid: uniqueId });
    } catch (error) {
        console.error("❌ Error fetching system UUID:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// // Route to Get User's System Information
// app.get("/get-system-info", async (req, res) => {
//     try {
//         const system = await si.system(); // System info (UUID, Manufacturer)
//         const os = await si.osInfo(); // OS details
//         const bios = await si.bios(); // BIOS details
//         const network = await si.networkInterfaces(); // Network interfaces
//         const user = await si.users(); // Current user details
//         const localIp = network[0]?.ip4 || "Unknown"; // Get first network IP
//         const macAddress = network[0]?.mac || "Unknown"; // Get first MAC
//         // const publicIpAddress = await req.ip.v4(); // Fetch public IP

//         const systemInfo = {
//             uuid: system.uuid, // Permanent Unique ID
//             manufacturer: system.manufacturer,
//             model: system.model,
//             // biome-ignore lint/style/useTemplate: <explanation>
//             os: os.distro + " " + os.release, // OS Name + Version
//             platform: os.platform, // Windows, Linux, macOS
//             biosSerial: bios.serial, // BIOS Serial Number
//             userName: user[0]?.user || "Unknown", // Logged-in user
//             localIp,
//             // publicIp: publicIpAddress,
//             macAddress,
//         };

//         console.log("✅ System Info:", systemInfo);
//         res.json(systemInfo);
//     } catch (error) {
//         console.error("❌ Error fetching system info:", error);
//         res.status(500).json({ message: "Error retrieving system info" });
//     }
// });

// // biome-ignore lint/style/useConst: <explanation>
// let storedUUIDs = [];

// app.post("/store-uuid", (req, res) => {
//     const { uuid } = req.body;
//     if (!uuid) return res.status(400).json({ message: "No UUID provided" });

//     storedUUIDs.push(uuid);
//     console.log("✅ UUID Stored:", uuid);
//     res.json({ message: "UUID stored successfully!" });
// });

// // API to receive machine details & generate UUID
// app.post("/register-machine11", (req, res) => {
//     console.log("1")
//     console.log("Received Data:", req.body); // ✅ Debug incoming data
//     const { userAgent, screenResolution, hardwareConcurrency, platform, vendor } = req.body;

//     if (!userAgent || !screenResolution || !hardwareConcurrency || !platform || !vendor) {
//         return res.status(400).json({ error: "Incomplete device data" });
//     }

//     // Generate a UUID based on device details
//     const uniqueString = `${userAgent}-${screenResolution}-${hardwareConcurrency}-${platform}-${vendor}`;
//     const uuid = crypto.createHash("sha256").update(uniqueString).digest("hex");

//     // biome-ignore lint/style/useTemplate: <explanation>
//     console.log("uniqueString-->" + uniqueString);
//     // biome-ignore lint/style/useTemplate: <explanation>
//     console.log("uuid-->" + uuid);

//     // // Check if UUID exists in the database
//     // db.query("SELECT * FROM users WHERE uuid = ?", [uuid], (err, results) => {
//     //   if (err) return res.status(500).json({ error: "Database Error" });

//     //   if (results.length === 0) {
//     //     // Store UUID if not exists
//     //     db.query("INSERT INTO users (uuid) VALUES (?)", [uuid], (insertErr) => {
//     //       if (insertErr) return res.status(500).json({ error: "Insert Error" });
//     //       res.json({ uuid, alert: "New Machine Registered!" });
//     //     });
//     //   } else {
//     //     res.json({ uuid, alert: "Machine Already Registered!" });
//     //   }
//     // });
// });

// // Register user machine
// app.post("/register-machine", (req, res) => {
//     console.log("Received Data:", req.body);

//     const { fingerprint } = req.body;
//     if (!fingerprint) {
//         return res.status(400).json({ error: "Missing fingerprint" });
//     }

//     // Check if UUID exists in database
//     db.query("SELECT * FROM users WHERE uuid = ?", [fingerprint], (err, results) => {
//         if (err) return res.status(500).json({ error: "Database error" });

//         if (results.length === 0) {
//             // Register new machine
//             db.query("INSERT INTO users (uuid) VALUES (?)", [fingerprint], (insertErr) => {
//                 if (insertErr) return res.status(500).json({ error: "Insert error" });
//                 res.json({ uuid: fingerprint, alert: "New Machine Registered!" });
//             });
//         } else {
//             res.json({ uuid: fingerprint, alert: "Machine Already Registered!" });
//         }
//     });
// });


// app.get("/run-uuid-script", (req, res) => {
//     exec("node D:\\net8.0-windows\\GETMAC.exe", (error, stdout, stderr) => {
//         if (error) {
//             console.error("❌ Error executing script:", error);
//             return res.status(500).json({ message: "Failed to fetch UUID" });
//         }
//         console.log("✅ Script Output:", stdout);
//         res.json({ message: stdout.trim() });
//     });
// });

// // ✅ Run the .exe file on User's Machine
// app.get("/run-exe", (req, res) => {
//     const exePath = `"D://net8.0-windows//GETMAC.exe"`; // Change to the correct path

//     exec(exePath, (error, stdout, stderr) => {
//         if (error) {
//             console.error("❌ Error executing .exe:", error);
//             return res.status(500).json({ message: "Failed to run .exe" });
//         }
//         console.log("✅ .exe Output:", stdout);
//         res.json({ message: "✅ .exe executed successfully!" });
//     });
// });


app.listen(PORT, host, () => {
    // biome-ignore lint/style/useTemplate: <explanation>
    console.log("Server running at http://" + host + ":" + PORT);
});
