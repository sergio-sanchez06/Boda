import path from 'path';
import { fileURLToPath } from 'url';
import express from "express";
import cors from "cors";

const port = 3000
const app = express()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dist = path.resolve(__dirname, '../../client/dist')

app.use(

    cors({

        origin: "http://localhost:5173",
        credentials: true,
        
    })

)

app.use(express.json())

app.use(express.urlencoded({extended: true}))

app.use(express.static(dist))


app.listen(port, () => {

    console.log(`Server running in port: ${port}`)

})
