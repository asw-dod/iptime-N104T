const express = require('express')
const axios = require('axios')

const gateway = "http://192.168.42.1"

const app = express()
app.use(express.json());

const port = 3000

function makeCfg(text) {
    var ttt = String(text)
    var txtStart = ttt.indexOf('(') + 1
    var txtEnd = ttt.lastIndexOf(')')
    var fText = ttt.substring(txtStart, txtEnd)
    var slice = fText.split(",");
    var t = String(slice[2]).replace(/\'/g, '').split(';')


    var result = {
        name: String(slice[0]).replace(/\'/g, ''),
        id: Number(slice[1]),

        text: {
            name: t[1] ?? "",
            sourcePort: t[2] ?? "",
            protocol: t[3] ?? "",
            ip: t[4] ?? "",
            destPort: t[5] ?? ""
        }
    }
    return result
}

// CMD: PORT_FORWARD
// GO: natrouterconf_portforward.html
// nowait: 1
// SET0: 151323164=

async function getCfg() {
    const response = await axios.get(gateway + "/natrouterconf_portforward.html")
    var data = response.data
    var spt = data.split('\n')
    var debg = spt.filter(item => item.startsWith("addCfg"));
    var make = debg.map(item => makeCfg(item))

    return make.filter(item => item.name.startsWith("VS"))
}

app.get('/port-foward', async (req, res) => {
    try {
        var make = await getCfg()
        var ports = make.filter(item => item.name.startsWith("VS"))

        var used = ports.filter(item => item.text.ip != '')
            .map(item => {
                delete item.name
                return item
            })

        res.json({
            max: 32, count: used.length,
            data: used
        })

    } catch (error) {
        res.json({
            result: false,
            error: "internal network error"
        })
    }
})

app.get('/port-foward/:id', async (req, res) => {
    try {
        var ports = await getCfg()
        var used = ports.filter(item => item.text.ip != '')
        var paramId = req.params.id

        var idx = used.findIndex(item => item.id == paramId)

        if (idx == -1) {
            res.json({
                result: false,
                error: "index error"
            })
            return
        }

        var user = ports[idx]
        // delete user.name

        res.json({
            result: user.text
        })

    } catch (error) {
        res.json({
            result: false,
            error: "internal network error"
        })
    }
})

app.post('/port-foward', async (req, res) => {
    try {
        var ports = await getCfg()
        var used = ports.filter(item => item.text.ip != '')
        var remain = ports.filter(item => item.text.ip == '')

        var makeText = "CMD=PORT_FORWARD&GO=natrouterconf_portforward.html&nowait=1&"

        if (req.body.length <= 0) {
            res.json({
                result: false,
                error: "not found request items"
            })
            return
        } else if (remain.length < req.body.length) {
            res.json({
                result: false,
                error: "not remian items"
            })
            return
        } else if (used.length >= 32) {
            res.json({
                result: false,
                error: "max count"
            })
            return
        }

        for (var i = 0; i < req.body.length; i++) {
            var elem = ''

            elem = remain[i].id + "=1;" + req.body[i].name + ";" + req.body[i].sourcePort + ";" +
                req.body[i].protocol + ';' + req.body[i].ip + ';' + req.body[i].destPort + ';0;;'

            makeText += 'SET' + i + "=" + elem.replace(/=/g, '%3D').replace(/;/g, '%3B') + "&"
        }

        await axios.post(gateway + "/do_cmd.htm", makeText)
        var getNewList = await getCfg();
        var list = getNewList.slice(used.length, used.length + req.body.length)
        var ppp = list.map(item => {
            delete item.name
            return item
        })

        res.json({
            result: ppp
        })

    } catch (error) {
        res.json({
            result: false,
            error: "internal network error"
        })
    }
})

app.delete('/port-foward/:id', async (req, res) => {
    try {
        var ports = await getCfg()
        var idx = ports.filter(item => item.text.ip != '')
            .findIndex(item => item.id == req.params.id)
            if (idx == -1) {
                res.json({
                    result: false,
                    error: "index error"
                })
                return
            }
            
        var makeText = "CMD=PORT_FORWARD&GO=natrouterconf_portforward.html&nowait=1&"
        makeText += 'SET0=' + req.params.id + "%3D"
        await axios.post(gateway + "/do_cmd.htm", makeText)
        var getNewList = await getCfg();
        var ppp = getNewList.map(item => {
            delete item.name
            return item
        })

        res.json({
            result: ppp.filter(item => item.text.ip != '')
        })

    } catch (error) {
        res.json({
            result: false,
            error: "internal network error"
        })
    }
})

app.delete('/port-foward', async (req, res) => {
    try {
        var makeText = "CMD=PORT_FORWARD&GO=natrouterconf_portforward.html&nowait=1&"


        if (req.body.data.length <= 0) {
            res.json({
                result: false,
                error: "not found request items"
            })
            return
        }

        for (var i = 0; i < req.body.data.length; i++) {
            var elem = ''
            elem = req.body.data[i] + "=";
            makeText += 'SET' + i + "=" + elem.replace(/=/g, '%3D').replace(/;/g, '%3B') + "&"
        }

        await axios.post(gateway + "/do_cmd.htm", makeText)
        var getNewList = await getCfg();
        var ppp = getNewList.map(item => {
            delete item.name
            return item
        })

        res.json({
            result: ppp.filter(item => item.text.ip != '')
        })

    } catch (error) {
        res.json({
            result: false,
            error: "internal network error"
        })
    }
})

app.put('/port-foward/:id', async (req, res) => {
    try {
        var ports = await getCfg()
        var idx = ports.filter(item => item.text.ip != '')
            .findIndex(item => item.id == req.params.id)

        if (idx == -1) {
            res.json({
                result: false,
                error: "index error"
            })
            return
        }

        var makeText = "CMD=PORT_FORWARD&GO=natrouterconf_portforward.html&nowait=1&"
        

        var elem = ''

        elem = req.params.id + "=1;" + req.body.name + ";" + req.body.sourcePort + ";" +
            req.body.protocol + ';' + req.body.ip + ';' + req.body.destPort + ';0;;'

        makeText += 'SET0=' + elem.replace(/=/g, '%3D').replace(/;/g, '%3B') + "&"

        await axios.post(gateway + "/do_cmd.htm", makeText)
        var getNewList = await getCfg();
        var idx2 = getNewList.findIndex(item => item.id == req.params.id)
        var capture = getNewList[idx2]
        delete capture.name
        

        res.json({
            result: capture
        })

    } catch (error) {
        res.json({
            result: false,
            error: "internal network error"
        })
    }
})

// app.use(bodyParser.urlencoded({extended : true}));

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})