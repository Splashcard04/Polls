const express = require(`express`)
const app = express()
const path = require(`path`)
const fs = require(`fs`)

app.set(`view engine`, `ejs`)
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, `css`)))
app.set('trust proxy', true)

const db = JSON.parse(fs.readFileSync(`./db.json`))

app.get(`/`, (req, res) => {
    res.render(__dirname + '/html/home.ejs')
})




app.get(`/create`, (req, res) => {
    res.render(__dirname + `/html/create.ejs`)
})

let index = 0;

app.post(`/addoption`, (req, res) => {
    index += 1
})

app.post(`/created`, (req, res) => {
    let title = req.body.title
    let user = req.body.user
    console.log(req.body)
    let options = []

    for(let i = 0; i < index; i++) {
        options.push({
            name: req.body[`option${i+1}`],
            votes: 0,
            id: i,
            voted: []
        })
    }

    let id = Math.floor(Math.random() * 10000000000).toString()
    let poll = {
        title: title,
        user: user,
        options: options,
        id: id,
        path: `/poll/${id}`
    }


    db.polls.push(poll)
    fs.writeFileSync(`./db.json`, JSON.stringify(db, null, 4))
    res.render(__dirname + `/html/created.ejs`, { path: `/poll/${id}` })
})



db.polls.forEach(x => {
    app.get(`${x.path}` , (req, res) => {
        res.render(__dirname + '/html/poll.ejs', { title: x.title, options: x.options, user: `${x.user}` })
    })
})


db.polls.forEach(x => {
    x.options.forEach(y => {
        app.post(`/vote${y.id}` , (req, res) => {
            let ip = req.socket.remoteAddress
            if(y.voted.find(x => x == ip)) {
                return res.send(`You have already voted!`)
            } else {
                y.votes += 1
                y.voted.push(ip)
                fs.writeFileSync(`./db.json`, JSON.stringify(db, null, 4))
                res.render(__dirname + '/html/poll.ejs', { title: x.title, options: x.options, user: `${x.user}` })
            }

        })
    })
})

app.get(`/details`, (req, res) => {
    res.render(__dirname + '/html/details.ejs')
})

app.listen(3000, () => {
    console.log(`Server is running on port 3000`)
})
