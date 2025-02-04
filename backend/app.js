import express from "express";
import { MemberRole, PrismaClient } from "@prisma/client";
import { ClerkExpressWithAuth } from "@clerk/clerk-sdk-node";
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer";
import { storage } from "./cloudConfig.js"; 
import { v4 as uuidv4 } from 'uuid';



dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};

app.use(
  ClerkExpressWithAuth({
    apiKey: process.env.CLERK_SECRET_KEY,
  })
);
app.use(express.json());
app.use(cors(corsOptions));



const upload = multer({ storage });


app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const cloudinaryUrl = req.file.path;
    console.log("File uploaded to Cloudinary: ", cloudinaryUrl);
    
    const fileDetails = {
      fileUrl: cloudinaryUrl,
      uploadedAt: new Date().toISOString(),
    };

   

    res.status(200).json({
      message: "File uploaded and details stored successfully",
      fileDetails,
    });
  } catch (error) {
    console.error("Error uploading file and storing details: ", error);
    res.status(500).json({ error: "Failed to upload file and store details" });
  }
});

app.post("/server", async (req, res) => {
  let { name, imageUrl, user } = req.body;
  console.log("user is : ", user.id);

  
  let profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    include: {
      servers: true, 
    },
  });

  if (!profile) {
    return res.status(404).json({ message: "Profile not found" });
  }

  
  const inviteCode = uuidv4(); 

  
  let server = await prisma.server.create({
    data: {
      name: name,
      imageUrl: imageUrl,
      inviteCode: inviteCode, 
      profileId: profile.id, 
      channels:{
        create:[
          {name:"general",profileId:profile.id}
        ]
      },
      members:{
        create:[
          {profileId:profile.id,role:MemberRole.ADMIN}
        ]
      }
    },
  });

  
  await prisma.profile.update({
    where: { userId: user.id },
    data: {
      servers: {
        connect: { id: server.id }, 
      },
    },
  });

  

  const serverId = server.id; 

  res.status(200).json({
    message: "Server details stored successfully",
   serverId
  });
});


app.get("/profile/:id", async (req, res) => {
  let { id } = req.params;

  try {
   
    let profile = await prisma.profile.findUnique({
      where: { userId: id },
    });

   
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

   
    res.status(200).json(profile);
  } catch (error) {
  
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "An error occurred while fetching the profile" });
  }
});



app.get("/servers/:id", async (req, res) => {
  let { id } = req.params;

  try {
   
    let profile = await prisma.profile.findUnique({
      where: { userId: id },
    });

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    
    let servers = await prisma.server.findMany({
      where: { profileId: profile.id },
    });

  
    res.status(200).json(servers);
  } catch (error) {
   
    console.error("Error fetching servers:", error);
    res.status(500).json({ error: "An error occurred while fetching servers" });
  }
});





app.post("/user", async (req, res) => {
  const { user } = req.body;

  if (!user) {
    return res
      .status(400)
      .json({ error: "User data is missing", redirectUrl: "/sign-in" });
  }

  try {
    let profile = await prisma.profile.findUnique({
      where: {
        userId: user.id,
      },
      include: {
        servers: true,
      },
    });

    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          userId: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.emailAddresses[0].emailAddress,
          imageUrl: user.imageUrl,
        },
      });
      return res.json({ redirectUrl: "/server" });
    }

    if (profile.servers.length === 0) {
      return res.json({ redirectUrl: "/server" });
    }

    let serverId = profile.servers[0].id;
    return res.json({ redirectUrl: `/server/${serverId}`,serverId });
  } catch (error) {
    console.error("Error creating/finding profile:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
