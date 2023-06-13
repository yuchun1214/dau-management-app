import React from 'react';
import db from '../database'
import Nvbar from '../common/components/nvbar.js'
import { LoginProvider } from '../common/contexts/LoginContext';
import { Container, Row, Col} from 'react-bootstrap';
import PieChart from '../common/components/PieChart';
import LineChart from '../common/components/LineChart'
import Footer from '../common/components/Footer'

import { daysInCurrentMonth, daysInTheMonth } from '../util/lib/utils';


export default function HomePage(props){
    const data = props.data
    const daily_data = props.daily_data;
    return (
        <>
            <LoginProvider>
                <Nvbar />
            </LoginProvider>
            <Container fluid="xl" style={{
                marginTop: "50px",
                marginBottom: "50px"
            }}>
                <Row>
                    <Col>
                        <div className='maincontainer'>
                            <PieChart data={data}/>
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <div className='maincontainer'>
                            <LineChart daily_data={daily_data}/>
                        </div>
                    </Col>
                </Row>
            </Container>
            <Footer />
        </>
    )

}

export async function getStaticProps(){
    const data = await getDataFromDatabase();
    const daily_data = await getDailyDataFromDatabase();
    return {
        props: {
            data, daily_data
        }
    }
}

async function getDailyDataFromDatabase(){
    // get the number of days in the current month
    const current_date = new Date();
    const current_year = current_date.getUTCFullYear();
    let current_month = current_date.getUTCMonth() + 1;

    const days_in_month = daysInCurrentMonth(current_year, current_month);

    // make the the current_month is 2 digits
    if(current_month < 10){
        current_month = '0' + current_month;
    }

    const sql = `SELECT username, DATE(start_time) AS start_time, SUM(computation_time_ms) AS daily_computation_time 
    FROM test_service_stats WHERE start_time >= '${current_year}-${current_month}-01 00:00:00' AND start_time <= '${current_year}-${current_month}-${days_in_month} 23:59:59' GROUP BY username, date(start_time)`

    // console.log(sql);

    return new Promise((resolve, reject) => {
        db.all(sql, [], (err, rows) => {
            if(err){
                console.error(err.message);
                reject(err);
            }
            // console.log("rows : ", rows);
            
            const daily_data = [];
            const user_data = {}

            for(var i = 0; i < rows.length; ++i){
                const row = rows[i];
                if(!(row.username in user_data)){
                    user_data[row.username] = [];
                }
                user_data[row.username].push(row)
            }
            
            // console.log(user_data)

            for(const username in user_data){
                const user_daily_data = {};
                user_daily_data['username'] = username;
                user_daily_data['data'] = [];

                const user_rows = user_data[username];
                var date = 1;
                for(var i = 0; i < user_rows.length; ++i){
                    // get the date of user_rows[i].start_time
                    const row = user_rows[i];
                    const row_date = new Date(row.start_time).getDate();
                    // console.log("row_date : ", row_date);
                    while(date < row_date){
                        user_daily_data['data'].push(0)
                        date += 1;
                    }
                    user_daily_data['data'].push(row.daily_computation_time / 60000);
                    date += 1;
                }
                while(date <= days_in_month){
                    user_daily_data['data'].push(0);
                    date += 1;
                }
                daily_data.push(user_daily_data);
            }
            // console.log(daily_data)
            resolve(daily_data);
        })
    })
}

async function getDataFromDatabase(){
    // get the current month and days
    const current_date = new Date();
    const current_year = current_date.getUTCFullYear();
    let current_month = current_date.getUTCMonth() + 1;

    const days_in_month = daysInTheMonth(current_year, current_month);

    // make the the current_month is 2 digits
    if(current_month < 10){
        current_month = '0' + current_month;
    }

    // query the database for the data in the current month
    const sql = `SELECT username, SUM(computation_time_ms) AS total_time 
    FROM test_service_stats WHERE start_time >= '${current_year}-${current_month}-01 00:00:00' AND start_time <= '${current_year}-${current_month}-${days_in_month} 23:59:59'
    GROUP BY username;`

    return new Promise((resolve, reject) => {
        db.all(sql, [], (err, rows) => {
            if(err){
                console.error(err.message);
                reject(err);
            }
            // console.log(rows);
            // sum of total_time 
            const sum = rows.reduce((acc, item) => acc + item.total_time, 0);
            // console.log(sum);
            rows.push({username: 'remain', total_time: 54000000 - sum});

            // the unit of the total_time is ms, convert it to minute
            rows.forEach((item) => {
                item.total_time = item.total_time / 60000;
            })

            // console.log(rows)

            resolve(rows);
        });
    })
}