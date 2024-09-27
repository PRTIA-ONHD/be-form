const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors'); 
const app = express()
const { sql, connectToDatabase } = require('./db'); // นำเข้า db.js

app.use(cors({
  origin: 'http://localhost:3000', // จำกัดเฉพาะ requests จาก localhost:3000
  methods: ['GET', 'POST','PUT'], // อนุญาตเฉพาะ GET , PUT และ POST requests
}));

app.use(bodyParser.json())

var port = 3030;

app.get('/' ,(req,res) => {
  res.send("somethig")
})

connectToDatabase(); // เรียกใช้การเชื่อมต่อฐานข้อมูล

app.post('/', async (req, res) => {
    let data = req.body;
    var dataFrom = { ...data };
    console.log(dataFrom);

      try {
        // แทรกข้อมูลลงในตาราง PetInformation
        const petInsertQuery = `
            INSERT INTO PetInformation (name, species, breed, gender, color, bitrhDate, otherData, img)
            VALUES (@name, @species, @breed, @gender, @color, @birthDate, @otherData, @img);
        `;

        const ownerInsertQuery = `
            INSERT INTO OwnerInformation (patId, firstName, lastName, address, phoneNumber, email)
            VALUES (@patId, @firstName, @lastName, @address, @phoneNumber, @email);
        `;

        const veterinaryInsertQuery = `
            INSERT INTO VeterinaryInformation (patId, firstName, lastName, clinicName, phoneNumber, email)
            VALUES (@patId, @firstName, @lastName, @clinicName, @phoneNumber, @email);
        `;

        // แทรกข้อมูลสัตว์เลี้ยง
        const petRequest = new sql.Request();
        petRequest.input('name', sql.NVarChar, dataFrom.petName);
        petRequest.input('species', sql.NVarChar, dataFrom.species);
        petRequest.input('breed', sql.NVarChar, dataFrom.breed);
        petRequest.input('gender', sql.Char(1), dataFrom.gender);
        petRequest.input('color', sql.NVarChar, dataFrom.color);
        petRequest.input('birthDate', sql.Date, new Date(dataFrom.birthdate));
        petRequest.input('otherData', sql.NVarChar, dataFrom.otherData);
        petRequest.input('img', sql.NVarChar, dataFrom.img || ''); // ใช้รูปภาพที่ระบุหรือค่าว่าง

        await petRequest.query(petInsertQuery);

        // สมมติว่าคุณต้องการใช้ ID ล่าสุดที่แทรกใน PetInformation เป็น patId
        const insertedPetId = await petRequest.query('SELECT @@IDENTITY AS id');
        const petId = insertedPetId.recordset[0].id;

        // แทรกข้อมูลเจ้าของ
        const ownerRequest = new sql.Request();
        ownerRequest.input('patId', sql.Int, petId);
        ownerRequest.input('firstName', sql.NVarChar, dataFrom.firstNameOwner);
        ownerRequest.input('lastName', sql.NVarChar, dataFrom.lastNameOwner);
        ownerRequest.input('address', sql.NVarChar, dataFrom.address);
        ownerRequest.input('phoneNumber', sql.NVarChar, dataFrom.phoneNumberOwner);
        ownerRequest.input('email', sql.NVarChar, dataFrom.emailOwner);

        await ownerRequest.query(ownerInsertQuery);

        // แทรกข้อมูลสัตวแพทย์
        const veterinaryRequest = new sql.Request();
        veterinaryRequest.input('patId', sql.Int, petId);
        veterinaryRequest.input('firstName', sql.NVarChar, dataFrom.firstNameDoctor);
        veterinaryRequest.input('lastName', sql.NVarChar, dataFrom.lastNameDoctor);
        veterinaryRequest.input('clinicName', sql.NVarChar, dataFrom.clinicName);
        veterinaryRequest.input('phoneNumber', sql.NVarChar, dataFrom.phoneNumberDoctor);
        veterinaryRequest.input('email', sql.NVarChar, dataFrom.emailDoctor);

        await veterinaryRequest.query(veterinaryInsertQuery);

        res.json({
            message: 'Data added successfully',
            user: dataFrom
        });
    } catch (err) {
        console.error('Error inserting data:', err);
        res.status(500).json({
            message: 'Error inserting data',
            error: err.message
        });
    }
});


// GET all data
app.get('/all-data', async (req, res) => {
  try {
      // เชื่อมต่อฐานข้อมูล
      const petRequest = new sql.Request();

      // ดึงข้อมูลจากตาราง PetInformation
      const pets = await petRequest.query('SELECT * FROM PetInformation');

      // ดึงข้อมูลจากตาราง OwnerInformation
      const owners = await petRequest.query('SELECT * FROM OwnerInformation');

      // ดึงข้อมูลจากตาราง VeterinaryInformation
      const veterinarians = await petRequest.query('SELECT * FROM VeterinaryInformation');

      // รวมผลลัพธ์
      res.json({
          pets: pets.recordset,
          owners: owners.recordset,
          veterinarians: veterinarians.recordset,
      });
  } catch (err) {
      console.error('Error fetching all data:', err);
      res.status(500).json({
          message: 'Error fetching all data',
          error: err.message
      });
  }
});

// PUT Update Data
app.put('/pets/:id', async (req, res) => {
  const petId = req.params.id;
  const data = req.body;

  try {
      const updateQuery = `
          UPDATE PetInformation 
          SET 
              name = @name, 
              species = @species, 
              breed = @breed, 
              gender = @gender, 
              color = @color, 
              birthDate = @birthDate, 
              otherData = @otherData, 
              img = @img
          WHERE id = @id;
      `;

      const petRequest = new sql.Request();
      petRequest.input('id', sql.Int, petId);
      petRequest.input('name', sql.NVarChar, data.petName);
      petRequest.input('species', sql.NVarChar, data.species);
      petRequest.input('breed', sql.NVarChar, data.breed);
      petRequest.input('gender', sql.Char(1), data.gender);
      petRequest.input('color', sql.NVarChar, data.color);
      petRequest.input('birthDate', sql.Date, new Date(data.birthdate));
      petRequest.input('otherData', sql.NVarChar, data.otherData);
      petRequest.input('img', sql.NVarChar, data.img || '');

      await petRequest.query(updateQuery);

      res.json({
          message: 'Data updated successfully',
      });
  } catch (err) {
      console.error('Error updating data:', err);
      res.status(500).json({
          message: 'Error updating data',
          error: err.message
      });
  }
});

// PUT Update Data for OwnerInformation
app.put('/owners/:patId', async (req, res) => {
  const patId = req.params.patId;
  const data = req.body;

  try {
    const updateOwnerQuery = `
      UPDATE OwnerInformation 
      SET 
          firstName = @firstName, 
          lastName = @lastName, 
          address = @address, 
          phoneNumber = @phoneNumber, 
          email = @email
      WHERE patId = @patId; 
    `;

    const ownerRequest = new sql.Request();
    ownerRequest.input('patId', sql.Int, patId);
    ownerRequest.input('firstName', sql.NVarChar, data.firstName);
    ownerRequest.input('lastName', sql.NVarChar, data.lastName);
    ownerRequest.input('address', sql.NVarChar, data.address);
    ownerRequest.input('phoneNumber', sql.NVarChar, data.phoneNumber);
    ownerRequest.input('email', sql.NVarChar, data.email);

    await ownerRequest.query(updateOwnerQuery);

    res.json({
      message: 'Owner data updated successfully',
    });
  } catch (err) {
    console.error('Error updating owner data:', err);
    res.status(500).json({
      message: 'Error updating owner data',
      error: err.message
    });
  }
});

// PUT Update Data for VeterinaryInformation
app.put('/veterinarians/:patId', async (req, res) => {
  const patId = req.params.patId;
  const data = req.body;

  try {
    const updateVeterinaryQuery = `
      UPDATE VeterinaryInformation 
      SET 
          firstName = @firstNameDoctor, 
          lastName = @lastNameDoctor, 
          clinicName = @clinicName, 
          phoneNumber = @phoneNumberDoctor, 
          email = @emailDoctor
      WHERE patId = @patId; 
    `;

    const veterinaryRequest = new sql.Request();
    veterinaryRequest.input('patId', sql.Int, patId);
    veterinaryRequest.input('firstNameDoctor', sql.NVarChar, data.firstNameDoctor);
    veterinaryRequest.input('lastNameDoctor', sql.NVarChar, data.lastNameDoctor);
    veterinaryRequest.input('clinicName', sql.NVarChar, data.clinicName);
    veterinaryRequest.input('phoneNumberDoctor', sql.NVarChar, data.phoneNumberDoctor);
    veterinaryRequest.input('emailDoctor', sql.NVarChar, data.emailDoctor);

    await veterinaryRequest.query(updateVeterinaryQuery);

    res.json({
      message: 'Veterinary data updated successfully',
    });
  } catch (err) {
    console.error('Error updating veterinary data:', err);
    res.status(500).json({
      message: 'Error updating veterinary data',
      error: err.message
    });
  }
});

app.listen(port, () => {
  console.log(`Start server at ${port}`)
})