package config

import (
	"fmt"
	"time"

	"github.com/tanapon395/sa-67-example/entity"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var db *gorm.DB

func DB() *gorm.DB {
	return db
}

func ConnectionDB() {
	database, err := gorm.Open(sqlite.Open("sa.db?cache=shared"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}
	fmt.Println("connected database")
	db = database
}

func IntPtr(i int) *int {
	return &i
}

func SetupDatabase() {

	db.AutoMigrate(
		&entity.User{},
		&entity.Gender{},
		//work
		&entity.Work{},
		&entity.WorkType{},
		&entity.WorkStatus{},
		&entity.WorkHistory{},
		//dashboard
		&entity.Dashboard{},
		//booking
		&entity.Booking{},
		//checkin
		&entity.CheckIn{},
		&entity.Review{},

	)

	checkIn := []entity.CheckIn{
		// {
		// 	UserID: 1,
		// 	WorkID: 1,
		// },
		{UserID: 0,
			WorkID: 0,
		},
		{
			UserID: 1,
			WorkID: 0,
		},
	}
	for _, c := range checkIn {
		db.FirstOrCreate(&c, entity.CheckIn{UserID: c.UserID, WorkID: c.WorkID})
	}

	bookings := []entity.Booking{
		{UserID: 0, WorkID: 0, Status: "registered"},
	}

	for _, b := range bookings {
		db.FirstOrCreate(&b, entity.Booking{UserID: b.UserID, WorkID: b.WorkID})
	}

	// // สร้างข้อมูล WorkHistory ตัวอย่าง

	// workHistories := []entity.WorkHistory{
	// 	{
	// 		UserID:        3,
	// 		WorkID:        1,
	// 		PaidAmount:    nil,
	// 		VolunteerHour: IntPtr(3),
	// 	},
	// 	{
	// 		UserID:        3,
	// 		WorkID:        2,
	// 		PaidAmount:    IntPtr(300),
	// 		VolunteerHour: nil,
	// 	},
	// 	{
	// 		UserID:        3,
	// 		WorkID:        3,
	// 		PaidAmount:    nil,
	// 		VolunteerHour: IntPtr(5),
	// 	},
	// 	{
	// 		UserID:        4,
	// 		WorkID:        3,
	// 		PaidAmount:    nil,
	// 		VolunteerHour: IntPtr(5),
	// 	},
	// 	{
	// 		UserID:        4,
	// 		WorkID:        4,
	// 		PaidAmount:    nil,
	// 		VolunteerHour: IntPtr(2),
	// 	},
	// 	{
	// 		UserID:        4,
	// 		WorkID:        5,
	// 		PaidAmount:    IntPtr(500),
	// 		VolunteerHour: nil,
	// 	},
	// 	{
	// 		UserID:        4,
	// 		WorkID:        10,
	// 		PaidAmount:    IntPtr(600),
	// 		VolunteerHour: nil,
	// 	},
	// }

	// for _, wh := range workHistories {
	// 	db.FirstOrCreate(&wh, entity.WorkHistory{UserID: wh.UserID, WorkID: wh.WorkID})
	// }

	//WorkStatus
	WorStatusActive := entity.WorkStatus{WorkStatus: "Active"}
	WorkStatusInactive := entity.WorkStatus{WorkStatus: "Inactive"}
	db.FirstOrCreate(&WorStatusActive, &entity.WorkStatus{WorkStatus: "Active"})
	db.FirstOrCreate(&WorkStatusInactive, &entity.WorkStatus{WorkStatus: "Inactive"})

	//WorkType
	WorkTypePaid := entity.WorkType{WorkType: "Paid"}
	WorkTypeVounteer := entity.WorkType{WorkType: "Volunteer"}
	db.FirstOrCreate(&WorkTypePaid, &entity.WorkType{WorkType: "Paid"})
	db.FirstOrCreate(&WorkTypeVounteer, &entity.WorkType{WorkType: "Volunteer"})
		work := []entity.Work{
		{
			Title:        "กิจกรรมจิตอาสาทำความสะอาด",
			Description:  "ชวนเพื่อนๆ มาร่วมกันทำความสะอาดบริเวณมหาวิทยาลัย",
			Place:        "ลานหน้าคณะวิทยาศาสตร์",
			Latitude:     13.736717,
			Longitude:    100.523186,
			WorkUse:      0,
			WorkCount:    10,
			WorkTime:     time.Date(2025, 11, 10, 9, 0, 0, 0, time.UTC),
			Photo:        "https://addnews.up.ac.th/main/UploadImages/32783/1dyprkak.jpg",
			WorkStatusID: 1,         // Active
			WorkTypeID:   2,         // Volunteer
			Volunteer:    IntPtr(3), // 3 ชั่วโมง
			PosterID:     1,
		},
		{
			Title:        "ผู้ช่วยดูแลบูธนิทรรศการ",
			Description:  "ต้องการผู้ช่วยดูแลบูธแสดงผลงานของนักศึกษา",
			Place:        "ห้องประชุมใหญ่ อาคารอเนกประสงค์",
			Latitude:     13.730000,
			Longitude:    100.510000,
			WorkUse:      0,
			WorkCount:    5,
			WorkTime:     time.Date(2025, 11, 10, 10, 0, 0, 0, time.UTC),
			Photo:        "https://www.mhesi.go.th/images/2565/Pornnapa/01/310165/6/2.jpg",
			WorkStatusID: 1,
			WorkTypeID:   1,
			Paid:         IntPtr(300),
			PosterID:     1,
		},
		{
			Title:        "พี่เลี้ยงกิจกรรมเด็ก",
			Description:  "ร่วมทำกิจกรรมและดูแลเด็กๆ ในงานวันเด็ก",
			Place:        "สวนลุมพินี",
			Latitude:     13.730401,
			Longitude:    100.541016,
			WorkUse:      0,
			WorkCount:    5,
			WorkTime:     time.Date(2025, 11, 10, 9, 0, 0, 0, time.UTC),
			Photo:        "https://science.mahidol.ac.th/th/activity/photo/may62-11/08.jpg",
			WorkStatusID: 1,
			WorkTypeID:   2,
			Volunteer:    IntPtr(5),
			PosterID:     1,
		},
		{
			Title:        "แจกแผ่นพับรณรงค์การอนุรักษ์พลังงาน",
			Description:  "ประชาสัมพันธ์ความรู้เรื่องพลังงานให้กับประชาชน",
			Place:        "หน้าสถานีรถไฟฟ้าอโศก",
			Latitude:     13.737527,
			Longitude:    100.560318,
			WorkUse:      0,
			WorkCount:    4,
			WorkTime:     time.Date(2025, 11, 10, 9, 0, 0, 0, time.UTC),
			Photo:        "https://สื่อการสอนฟรี.com/wp-content/uploads/2023/07/315430390_6326639150686452_8891593174735426634_n-768x1024.jpg",
			WorkStatusID: 1,
			WorkTypeID:   2,
			Volunteer:    IntPtr(2),
			PosterID:     1,
		},
		{
			Title:        "แคชเชียร์ร้านกาแฟ (Part-time)",
			Description:  "ร้านกาแฟเปิดใหม่ ต้องการแคชเชียร์ช่วงเย็น",
			Place:        "คาเฟ่ 1989, BTS อารีย์",
			Latitude:     13.779732,
			Longitude:    100.544119,
			WorkUse:      0,
			WorkCount:    3,
			WorkTime:     time.Date(2025, 11, 10, 9, 0, 0, 0, time.UTC),
			Photo:        "https://www.designil.com/wp-content/uploads/2023/08/Fast-Food-Attendant-scaled.jpg",
			WorkStatusID: 1,
			WorkTypeID:   1,
			Paid:         IntPtr(500),
			PosterID:     1,
		},
		{
			Title:        "ช่างภาพงานรับปริญญา",
			Description:  "ต้องการผู้ช่วยช่างภาพเก็บภาพบัณฑิต",
			Place:        "มหาวิทยาลัยศิลปากร",
			Latitude:     13.821244,
			Longitude:    100.513158,
			WorkUse:      0,
			WorkCount:    4,
			WorkTime:     time.Date(2025, 11, 10, 7, 0, 0, 0, time.UTC),
			Photo:        "https://www.khaosod.co.th/wpapp/uploads/2024/12/camera1226-1.jpg",
			WorkStatusID: 1,
			WorkTypeID:   1,
			Paid:         IntPtr(800),
			PosterID:     1,
		},
		{
			Title:        "งานดูแลสัตว์เลี้ยง (Vol.)",
			Description:  "ช่วยดูแลสัตว์ที่ศูนย์พักพิงในช่วงวันหยุด",
			Place:        "ศูนย์พักพิงสัตว์บางใหญ่",
			Latitude:     13.880000,
			Longitude:    100.400000,
			WorkUse:      0,
			WorkCount:    4,
			WorkTime:     time.Date(2025, 11, 10, 9, 0, 0, 0, time.UTC),
			Photo:        "https://www.sut.ac.th/2012/images/upload/editor/images/201811/03.jpg",
			WorkStatusID: 1,
			WorkTypeID:   2,
			Volunteer:    IntPtr(6),
			PosterID:     1,
		},
		{
			Title:        "ผู้ช่วยงานแพ็คสินค้า",
			Description:  "แพ็คสินค้าตามออเดอร์ออนไลน์ มีค่าแรงตามชิ้น",
			Place:        "โกดังพระราม 2",
			Latitude:     13.651859,
			Longitude:    100.457328,
			WorkUse:      0,
			WorkCount:    10,
			WorkTime:     time.Date(2025, 11, 10, 9, 0, 0, 0, time.UTC),
			Photo:        "https://media.graphassets.com/LhEdoVQEWmDl0NvvBnkQ",
			WorkStatusID: 1,
			WorkTypeID:   1,
			Paid:         IntPtr(400),
			PosterID:     1,
		},
		{
			Title:        "อาสาสมัครเก็บขยะชายหาด",
			Description:  "รักษาสิ่งแวดล้อมด้วยการช่วยกันเก็บขยะบริเวณชายหาด",
			Place:        "หาดบางแสน",
			Latitude:     13.280000,
			Longitude:    100.920000,
			WorkUse:      0,
			WorkCount:    20,
			WorkTime:     time.Date(2025, 11, 10, 8, 0, 0, 0, time.UTC),
			Photo:        "https://thaipublica.org/wp-content/uploads/2024/11/KKP-%E0%B8%88%E0%B8%B4%E0%B8%95%E0%B8%AD%E0%B8%B2%E0%B8%AA%E0%B8%B2-%E0%B8%9A%E0%B8%B2%E0%B8%87%E0%B9%81%E0%B8%AA%E0%B8%99-2.jpg",
			WorkStatusID: 1,
			WorkTypeID:   2,
			Volunteer:    IntPtr(4),
			PosterID:     2,
		},
		{
			Title:        "อาสาสมัครอ่านหนังสือให้ผู้พิการทางสายตา",
			Description:  "อ่านหนังสือเสียงและบันทึกเพื่อส่งต่อให้ผู้พิการทางสายตา",
			Place:        "หอสมุดคนตาบอดแห่งชาติ",
			Latitude:     13.769880,
			Longitude:    100.565183,
			WorkUse:      0,
			WorkCount:    6,
			WorkTime:     time.Date(2025, 11, 10, 10, 0, 0, 0, time.UTC),
			Photo:        "https://static.trueplookpanya.com/tppy/member/m_537500_540000/538757/cms/images/DoGood2/www.cbm.org:World-Braille-Day-2014-292196.php_resized.jpg",
			WorkStatusID: 1,
			WorkTypeID:   2,
			Volunteer:    IntPtr(3),
			PosterID:     2,
		},
		{
			Title:        "กิจกรรมปลูกต้นไม้",
			Description:  "ช่วยกันปลูกต้นไม้เพิ่มพื้นที่สีเขียวให้กับชุมชน",
			Place:        "สวนสาธารณะหนองจอก",
			Latitude:     14.901579,
			Longitude:    102.012559,
			WorkUse:      0,
			WorkCount:    15,
			WorkTime:     time.Date(2025, 11, 10, 9, 0, 0, 0, time.UTC),
			Photo:        "https://www.sut.ac.th/images/upload/editor/images/202407/17/04.jpg",
			WorkStatusID: 1,
			WorkTypeID:   2,
			Volunteer:    IntPtr(4),
			PosterID:     1,
		},
		{
			Title:        "พนักงานต้อนรับงานสัมมนา",
			Description:  "ดูแลการลงทะเบียนและต้อนรับผู้ร่วมสัมมนา",
			Place:        "โรงแรมอโนมา แกรนด์",
			Latitude:     14.901579,
			Longitude:    102.012559,
			WorkUse:      0,
			WorkCount:    3,
			WorkTime:     time.Date(2025, 11, 10, 7, 30, 0, 0, time.UTC),
			Photo:        "https://www.econ.tu.ac.th/public/upload/news/2025/06%20June%202025/S__12886065_0%20-%20Paweena%20Jamroen.jpg",
			WorkStatusID: 1,
			WorkTypeID:   1,
			Paid:         IntPtr(700),
			PosterID:     1,
		},
	}
	// บันทึกข้อมูลโปรโมชั่นตัวอย่างลงในฐานข้อมูล
	for _, w := range work {
		db.FirstOrCreate(&w, entity.Work{Title: w.Title})
	}

	//dashboard
	dashboards := []entity.Dashboard{
		{
			Subject:       "รับสมัครนักศึกษาจิตอาสา กิจกรรมต้อนรับนักศึกษาใหม่",
			Information:   "มทส. เปิดรับสมัครนักศึกษาร่วมเป็นจิตอาสาในการดูแลและแนะนำรุ่นน้องในงานปฐมนิเทศ",
			DashboardTime: time.Date(2025, 8, 22, 0, 0, 0, 0, time.UTC),
			Image:         "https://static.thairath.co.th/media/dFQROr7oWzulq5Fa6rBYyKnfNrPb4adsMUFHfn95v0mRxCeMbyo7LcLohJLQ6b6xs6K.jpg",
		},
		{
			Subject:       "ขอเชิญร่วมกิจกรรมวิ่ง SU Running 2025",
			Information:   "กิจกรรมเดิน-วิ่งเพื่อสุขภาพรอบอ่างเก็บน้ำภายใน มทส. สมัครฟรี มีเสื้อและของที่ระลึก",
			DashboardTime: time.Date(2024, 8, 2, 0, 0, 0, 0, time.UTC),
			Image:         "https://www.sut.ac.th/2012/images/upload/editor/images/201812/07/02.jpg",
		},
		{
			Subject:       "ประกาศปิดเส้นทางชั่วคราวในวันสอบกลางภาค",
			Information:   "โปรดหลีกเลี่ยงถนนด้านหลังศูนย์อาหารกลาง เวลา 07.30 - 16.00 น.",
			DashboardTime: time.Date(2023, 1, 22, 0, 0, 0, 0, time.UTC),
			Image:         "https://www.sut.ac.th/images/upload/news/1393/1393/news.jpg",
		},
		{
			Subject:       "กิจกรรมปลูกต้นไม้เนื่องในวันสิ่งแวดล้อมโลก",
			Information:   "ขอเชิญชวนนักศึกษาร่วมปลูกต้นไม้ภายในเขตมหาวิทยาลัย ณ ลานกิจกรรมกลาง",
			DashboardTime: time.Date(2025, 4, 1, 0, 0, 0, 0, time.UTC),
			Image:         "https://www.sut.ac.th/2012/images/upload/editor/images/202305/11/350106800_1281968609381712_7800034491766335402_n.jpg",
		},
		{
			Subject:       "โครงการอบรมเตรียมตัวสอบทุนต่างประเทศ",
			Information:   "ศูนย์แนะแนว มทส. จัดอบรมฟรี พร้อมให้คำปรึกษาการสมัครทุนและเตรียมเอกสาร",
			DashboardTime: time.Date(2025, 7, 28, 0, 0, 0, 0, time.UTC),
			Image:         "https://coop.sut.ac.th/image-2565/19082022-2.jpg",
		},
		{
			Subject:       "แจ้งซ่อมระบบน้ำบริเวณหอพัก 12-14",
			Information:   "การประปาจะปิดน้ำชั่วคราว วันที่ 15 ก.ค. เวลา 08.00 - 14.00 น.",
			DashboardTime: time.Date(2025, 1, 12, 0, 0, 0, 0, time.UTC),
			Image:         "https://beta.sut.ac.th/dsa-dorm/wp-content/uploads/sites/181/2020/09/%E0%B8%AB%E0%B8%AD15-1-Custom.jpg",
		},
		{
			Subject:       "รับสมัครนักศึกษาเข้าร่วมกิจกรรม Open House",
			Information:   "เปิดรับนักศึกษาร่วมเป็นวิทยากรนำชมมหาวิทยาลัยให้กับน้อง ม.ปลาย",
			DashboardTime: time.Date(2025, 2, 22, 0, 0, 0, 0, time.UTC),
			Image:         "https://sutgateway.sut.ac.th/admissions2021/wp-content/uploads/2025/05/BannerNewStu68.png",
		},
		{
			Subject:       "เปิดให้บริการ Co-working Space แห่งใหม่",
			Information:   "ห้องทำงานกลุ่มแห่งใหม่ที่อาคารเรียนรวม เปิดให้ใช้แล้ววันนี้!",
			DashboardTime: time.Date(2025, 8, 22, 0, 0, 0, 0, time.UTC),
			Image:         "https://sutgateway.sut.ac.th/ces/wp-content/uploads/2024/04/04.jpg",
		},
		{
			Subject:       "ขอเชิญร่วมอบรม Cybersecurity Awareness",
			Information:   "งานไอทีจัดอบรมให้ความรู้ด้านความปลอดภัยบนโลกออนไลน์ (รับชั่วโมงกิจกรรม)",
			DashboardTime: time.Date(2025, 8, 22, 0, 0, 0, 0, time.UTC),
			Image:         "https://old-engineer.kmitl.ac.th/wp-content/uploads/2021/01/138436196_4073735569304186_4786960076453964684_o-1.jpg",
		},
		{
			Subject:       "การแข่งขัน Startup Pitching รอบคัดเลือก",
			Information:   "ชมผลงานนวัตกรรมของนักศึกษาพร้อมลุ้นผู้ชนะตัวแทนไปแข่งขันระดับประเทศ",
			DashboardTime: time.Date(2025, 8, 22, 0, 0, 0, 0, time.UTC),
			Image:         "https://eng.sut.ac.th/ENG2023/wp-content/uploads/2025/04/IMG_4838.jpg",
		},
	}
	for _, d := range dashboards {
		db.FirstOrCreate(&d, entity.Dashboard{Subject: d.Subject})
	}

	//gender
	GenderMale := entity.Gender{Name: "Male"}
	GenderFemale := entity.Gender{Name: "Female"}
	db.FirstOrCreate(&GenderMale, &entity.Gender{Name: "Male"})
	db.FirstOrCreate(&GenderFemale, &entity.Gender{Name: "Female"})

	// สร้าง Users ตัวอย่าง พร้อม Role
	hashedPassword, _ := HashPassword("123456")
	birthAdmin, _ := time.Parse("2006-01-02", "1985-01-15")
	Admin := &entity.User{
		FirstName: "Software",
		LastName:  "Analyst",
		Email:     "sut@gmail.com",
		Password:  hashedPassword,
		BirthDay:  birthAdmin,
		Profile:   "https://i.pinimg.com/736x/76/b2/ab/76b2abcc22f272d3cd03d4e63f2b75b5.jpg",
		GenderID:  2,
		Role:      "admin",
	}
	db.FirstOrCreate(Admin, &entity.User{Email: "sut@gmail.com"})

	hashedPassword4, _ := HashPassword("123456")
	birthAdmin2, _ := time.Parse("2006-01-02", "1988-11-05")
	Admin2 := &entity.User{
		FirstName: "Kibutsuji",
		LastName:  "Muzan",
		Email:     "admin@gmail.com",
		Password:  hashedPassword4,
		BirthDay:  birthAdmin2,
		Profile:   "https://i.pinimg.com/736x/76/b2/ab/76b2abcc22f272d3cd03d4e63f2b75b5.jpg",
		GenderID:  1,
		Role:      "admin",
	}
	db.FirstOrCreate(Admin2, &entity.User{Email: "admin@gmail.com"})

	hashedPassword2, _ := HashPassword("123456")
	birthUser, _ := time.Parse("2006-01-02", "1995-03-22")
	NormalUser := &entity.User{
		FirstName: "Tokito",
		LastName:  "Muichiro",
		Email:     "s1@gmail.com",
		Password:  hashedPassword2,
		BirthDay:  birthUser,
		Profile:   "https://i.redd.it/816bcekqqogd1.jpeg",
		GenderID:  1,
		Role:      "user",
	}
	db.FirstOrCreate(NormalUser, &entity.User{Email: "s1@gmail.com"})

	hashedPassword5, _ := HashPassword("123456")
	birthUser2, _ := time.Parse("2006-01-02", "1998-09-14")
	NormalUser2 := &entity.User{
		FirstName: "Tomioka",
		LastName:  "Giyu",
		Email:     "s2@gmail.com",
		Password:  hashedPassword5,
		BirthDay:  birthUser2,
		Profile:   "https://i.pinimg.com/736x/76/b2/ab/76b2abcc22f272d3cd03d4e63f2b75b5.jpg",
		GenderID:  1,
		Role:      "user",
	}
	db.FirstOrCreate(NormalUser2, &entity.User{Email: "s2@gmail.com"})

	hashedPassword3, _ := HashPassword("123456")
	birthEmployer, _ := time.Parse("2006-01-02", "1992-07-10")
	Employer := &entity.User{
		FirstName: "Akaza",
		LastName:  "Demon",
		Email:     "em1@gmail.com",
		Password:  hashedPassword3,
		BirthDay:  birthEmployer,
		Profile:   "https://i.pinimg.com/736x/76/b2/ab/76b2abcc22f272d3cd03d4e63f2b75b5.jpg",
		GenderID:  1,
		Role:      "employer",
	}
	db.FirstOrCreate(Employer, &entity.User{Email: "em1@gmail.com"})

	hashedPassword6, _ := HashPassword("123456")
	birthEmployer2, _ := time.Parse("2006-01-02", "1990-05-30")
	Employer2 := &entity.User{
		FirstName: "Kamado",
		LastName:  "Nezuko",
		Email:     "em2@gmail.com",
		Password:  hashedPassword6,
		BirthDay:  birthEmployer2,
		Profile:   "https://i.pinimg.com/736x/76/b2/ab/76b2abcc22f272d3cd03d4e63f2b75b5.jpg",
		GenderID:  1,
		Role:      "employer",
	}
	db.FirstOrCreate(Employer2, &entity.User{Email: "em2@gmail.com"})

}
