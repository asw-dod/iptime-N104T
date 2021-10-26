const express = require('express')
const axios = require('axios')

const gateway = "http://192.168.42.1"

const app = express()
const port = 3000


// VSList[num]="1;"+
// f.name.value+";"+
// f.i_port1.value+"-"+f.i_port2.value+";"+
// f.protocol.value+";"+
// GetIP("os_ip")+";"+
// f.o_port1.value+";"+
// "0;"+
// ";";

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

app.get('/port-foward', async (req, res) => {
    try {
        const response = await axios.get(gateway + "/natrouterconf_portforward.html")
        var data = response.data
        var spt = data.split('\n')
        var debg = spt.filter(item => item.startsWith("addCfg"));
        var make = debg.map(item => makeCfg(item))
        var ports = make.filter(item => item.name.startsWith("VS"))
        
        var used = ports.filter(item => item.text.ip != '')
        .map(item => {
            // delete item.name
            // delete item.id
            return item.text
        })
        

        res.json({max: 32, count: used.length,
            data: used
        })

    } catch (error) {
        console.log(error)
    }
})

app.get('/port-foward/:id', async (req, res) => {
    try {
        const response = await axios.get(gateway + "/natrouterconf_portforward.html")

        var data = response.data
        var spt = data.split('\n')
        var debg = spt.filter(item => item.startsWith("addCfg"));
        var make = debg.map(item => makeCfg(item))
        
        var ports = make.filter(item => item.name.startsWith("VS"))
        var used = ports.filter(item => item.text.ip != '')
        
        var paramId = req.params.id
        
        if (!(0<= paramId && paramId < used.length)) { 
            res.json({
                result: false,
                error: "index error"
            })
            return
        }
        
        var user = ports[paramId]
        delete user.name
        
        res.json({
            result: user.text
        })

    } catch (error) {
        console.log(error)
    }
})

app.post('/port-foward')


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})