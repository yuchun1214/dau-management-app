import { CircularProgressbar } from "react-circular-progressbar"
import { useEffect, useState } from "react";
import { Container, Row, Col} from 'react-bootstrap';
import { backgroundColor, borderColor } from "../constants/colors";
import 'react-circular-progressbar/dist/styles.css'

export default function Use({data}){
    console.log(data)

    const [ percentage, setPercentage] = useState(0)

    useEffect(()=>{
        console.log(data)

        if(data !== undefined){
            let total = 0;
            data.forEach((item) => {
                if(item.total_time > 0 && item.username !== "remain")
                    total += item.total_time;
            })
            console.log("total : ", total)
            setPercentage((total / 900)*100)
        }
    }, [data])
    

    return <>
        <Container>
            <Row>
                
                <Col>
                    <CircularProgressbar value={percentage} text={`${percentage.toFixed(2)}%`} />
                </Col>
            </Row>
            <Row>
                {data.map((item, index) => (
                  <li key={index} style={{ color: borderColor[index] }}>
                    {item.username} : {item.total_time.toFixed(2)}
                  </li>
                ))}
            </Row>

        </Container> 
    </>
}