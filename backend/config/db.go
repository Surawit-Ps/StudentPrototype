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
	)

	checkIn := []entity.CheckIn{
		// {
		// 	UserID: 1,
		// 	WorkID: 1,
		// },
		{UserID: 2,
			WorkID: 2,
		},
		{
			UserID: 3,
			WorkID: 3,
		},
	}
	for _, c := range checkIn {
		db.FirstOrCreate(&c, entity.CheckIn{UserID: c.UserID, WorkID: c.WorkID})
	}

	bookings := []entity.Booking{
		{UserID: 2, WorkID: 1, Status: "registered"},
		{UserID: 3, WorkID: 1, Status: "registered"},
		{UserID: 4, WorkID: 1, Status: "registered"},
		{UserID: 3, WorkID: 1, Status: "registered"},
		{UserID: 3, WorkID: 2, Status: "registered"},
		{UserID: 4, WorkID: 3, Status: "registered"},
		{UserID: 5, WorkID: 4, Status: "registered"},
	}

	for _, b := range bookings {
		db.FirstOrCreate(&b, entity.Booking{UserID: b.UserID, WorkID: b.WorkID})
	}

	// สร้างข้อมูล WorkHistory ตัวอย่าง

	workHistories := []entity.WorkHistory{
		{
			UserID:        3,
			WorkID:        1,
			PaidAmount:    nil,
			VolunteerHour: IntPtr(3),
		},
		{
			UserID:        3,
			WorkID:        2,
			PaidAmount:    IntPtr(300),
			VolunteerHour: nil,
		},
		{
			UserID:        3,
			WorkID:        3,
			PaidAmount:    nil,
			VolunteerHour: IntPtr(5),
		},
		{
			UserID:        4,
			WorkID:        3,
			PaidAmount:    nil,
			VolunteerHour: IntPtr(5),
		},
		{
			UserID:        4,
			WorkID:        4,
			PaidAmount:    nil,
			VolunteerHour: IntPtr(2),
		},
		{
			UserID:        4,
			WorkID:        5,
			PaidAmount:    IntPtr(500),
			VolunteerHour: nil,
		},
		{
			UserID:        4,
			WorkID:        10,
			PaidAmount:    IntPtr(600),
			VolunteerHour: nil,
		},
	}

	for _, wh := range workHistories {
		db.FirstOrCreate(&wh, entity.WorkHistory{UserID: wh.UserID, WorkID: wh.WorkID})
	}

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

	//Work
	work := []entity.Work{
		{
			Title:        "กิจกรรมจิตอาสาทำความสะอาด",
			Description:  "ชวนเพื่อนๆ มาร่วมกันทำความสะอาดบริเวณมหาวิทยาลัย",
			Place:        "ลานหน้าคณะวิทยาศาสตร์",
			Latitude:     13.736717,
			Longitude:    100.523186,
			WorkUse:      1,
			WorkCount:    8,
			WorkTime:     time.Date(2025, 7, 20, 9, 0, 0, 0, time.UTC),
			Photo:        "https://i.pinimg.com/736x/ce/5f/a0/ce5fa0a6d07dc75d1cc6281945450294.jpg",
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
			WorkUse:      1,
			WorkCount:    5,
			WorkTime:     time.Date(2025, 7, 25, 10, 0, 0, 0, time.UTC),
			Photo:        "https://i.pinimg.com/736x/0b/df/01/0bdf01389cd7541a2a9fc5debc2fc7d0.jpg",
			WorkStatusID: 2,
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
			WorkUse:      1,
			WorkCount:    12,
			WorkTime:     time.Date(2025, 8, 12, 8, 30, 0, 0, time.UTC),
			Photo:        "https://i.pinimg.com/736x/0b/df/01/0bdf01389cd7541a2a9fc5debc2fc7d0.jpg",
			WorkStatusID: 2,
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
			WorkUse:      1,
			WorkCount:    6,
			WorkTime:     time.Date(2025, 7, 28, 15, 0, 0, 0, time.UTC),
			Photo:        "https://i.pinimg.com/736x/0b/df/01/0bdf01389cd7541a2a9fc5debc2fc7d0.jpg",
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
			WorkUse:      3,
			WorkCount:    3,
			WorkTime:     time.Date(2025, 8, 1, 17, 0, 0, 0, time.UTC),
			Photo:        "https://i.pinimg.com/736x/0b/df/01/0bdf01389cd7541a2a9fc5debc2fc7d0.jpg",
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
			WorkUse:      2,
			WorkCount:    2,
			WorkTime:     time.Date(2025, 8, 5, 6, 0, 0, 0, time.UTC),
			Photo:        "https://i.pinimg.com/736x/0b/df/01/0bdf01389cd7541a2a9fc5debc2fc7d0.jpg",
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
			WorkUse:      1,
			WorkCount:    4,
			WorkTime:     time.Date(2025, 7, 27, 9, 0, 0, 0, time.UTC),
			Photo:        "https://i.pinimg.com/736x/0b/df/01/0bdf01389cd7541a2a9fc5debc2fc7d0.jpg",
			WorkStatusID: 2,
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
			WorkUse:      2,
			WorkCount:    10,
			WorkTime:     time.Date(2025, 7, 30, 10, 0, 0, 0, time.UTC),
			Photo:        "https://i.pinimg.com/736x/0b/df/01/0bdf01389cd7541a2a9fc5debc2fc7d0.jpg",
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
			WorkUse:      12,
			WorkCount:    20,
			WorkTime:     time.Date(2025, 8, 8, 8, 0, 0, 0, time.UTC),
			Photo:        "https://i.pinimg.com/736x/0b/df/01/0bdf01389cd7541a2a9fc5debc2fc7d0.jpg",
			WorkStatusID: 1,
			WorkTypeID:   2,
			Volunteer:    IntPtr(4),
			PosterID:     2,
		},
		{
			Title:        "พนักงานแจกสินค้าโปรโมชั่น",
			Description:  "แจกสินค้าตัวอย่างให้กับลูกค้าตามห้างสรรพสินค้า",
			Place:        "เซ็นทรัลเวิลด์",
			Latitude:     13.746389,
			Longitude:    100.539444,
			WorkUse:      1,
			WorkCount:    5,
			WorkTime:     time.Date(2025, 8, 15, 13, 0, 0, 0, time.UTC),
			Photo:        "https://i.pinimg.com/736x/0b/df/01/0bdf01389cd7541a2a9fc5debc2fc7d0.jpg",
			WorkStatusID: 1,
			WorkTypeID:   1,
			Paid:         IntPtr(600),
			PosterID:     2,
		},
		{
			Title:        "อาสาสมัครอ่านหนังสือให้ผู้พิการทางสายตา",
			Description:  "อ่านหนังสือเสียงและบันทึกเพื่อส่งต่อให้ผู้พิการทางสายตา",
			Place:        "หอสมุดคนตาบอดแห่งชาติ",
			Latitude:     13.769880,
			Longitude:    100.565183,
			WorkUse:      1,
			WorkCount:    6,
			WorkTime:     time.Date(2025, 8, 10, 10, 0, 0, 0, time.UTC),
			Photo:        "https://i.pinimg.com/736x/0b/df/01/0bdf01389cd7541a2a9fc5debc2fc7d0.jpg",
			WorkStatusID: 1,
			WorkTypeID:   2,
			Volunteer:    IntPtr(3),
			PosterID:     2,
		},
		{
			Title:        "ผู้ช่วยร้านอาหาร (Part-time)",
			Description:  "ช่วยเสิร์ฟ เก็บจาน และดูแลลูกค้าในช่วงเย็น",
			Place:        "ร้านอาหารบ้านคุณย่า, รามคำแหง",
			Latitude:     13.7596,
			Longitude:    100.6335,
			WorkUse:      1,
			WorkCount:    4,
			WorkTime:     time.Date(2025, 8, 18, 17, 30, 0, 0, time.UTC),
			Photo:        "https://i.pinimg.com/736x/0b/df/01/0bdf01389cd7541a2a9fc5debc2fc7d0.jpg",
			WorkStatusID: 1,
			WorkTypeID:   1,
			Paid:         IntPtr(450),
			PosterID:     2,
		},
		{
			Title:        "กิจกรรมปลูกต้นไม้",
			Description:  "ช่วยกันปลูกต้นไม้เพิ่มพื้นที่สีเขียวให้กับชุมชน",
			Place:        "สวนสาธารณะหนองจอก",
			Latitude:     13.879,
			Longitude:    100.852,
			WorkUse:      1,
			WorkCount:    15,
			WorkTime:     time.Date(2025, 8, 20, 9, 0, 0, 0, time.UTC),
			Photo:        "https://i.pinimg.com/736x/0b/df/01/0bdf01389cd7541a2a9fc5debc2fc7d0.jpg",
			WorkStatusID: 1,
			WorkTypeID:   2,
			Volunteer:    IntPtr(4),
			PosterID:     1,
		},
		{
			Title:        "พนักงานต้อนรับงานสัมมนา",
			Description:  "ดูแลการลงทะเบียนและต้อนรับผู้ร่วมสัมมนา",
			Place:        "โรงแรมอโนมา แกรนด์",
			Latitude:     13.753241,
			Longitude:    100.540066,
			WorkUse:      1,
			WorkCount:    3,
			WorkTime:     time.Date(2025, 8, 22, 7, 30, 0, 0, time.UTC),
			Photo:        "https://i.pinimg.com/736x/0b/df/01/0bdf01389cd7541a2a9fc5debc2fc7d0.jpg",
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
			Image:         "https://i.pinimg.com/736x/92/e9/9f/92e99ffbcef0895a3b37eba1a1e78c38.jpg",
		},
		{
			Subject:       "ขอเชิญร่วมกิจกรรมวิ่ง SU Running 2025",
			Information:   "กิจกรรมเดิน-วิ่งเพื่อสุขภาพรอบอ่างเก็บน้ำภายใน มทส. สมัครฟรี มีเสื้อและของที่ระลึก",
			DashboardTime: time.Date(2024, 8, 2, 0, 0, 0, 0, time.UTC),
			Image:         "https://i.pinimg.com/736x/92/e9/9f/92e99ffbcef0895a3b37eba1a1e78c38.jpg",
		},
		{
			Subject:       "ประกาศปิดเส้นทางชั่วคราวในวันสอบกลางภาค",
			Information:   "โปรดหลีกเลี่ยงถนนด้านหลังศูนย์อาหารกลาง เวลา 07.30 - 16.00 น.",
			DashboardTime: time.Date(2023, 1, 22, 0, 0, 0, 0, time.UTC),
			Image:         "https://i.pinimg.com/736x/92/e9/9f/92e99ffbcef0895a3b37eba1a1e78c38.jpg",
		},
		{
			Subject:       "กิจกรรมปลูกต้นไม้เนื่องในวันสิ่งแวดล้อมโลก",
			Information:   "ขอเชิญชวนนักศึกษาร่วมปลูกต้นไม้ภายในเขตมหาวิทยาลัย ณ ลานกิจกรรมกลาง",
			DashboardTime: time.Date(2025, 4, 1, 0, 0, 0, 0, time.UTC),
			Image:         "https://i.pinimg.com/736x/92/e9/9f/92e99ffbcef0895a3b37eba1a1e78c38.jpg",
		},
		{
			Subject:       "โครงการอบรมเตรียมตัวสอบทุนต่างประเทศ",
			Information:   "ศูนย์แนะแนว มทส. จัดอบรมฟรี พร้อมให้คำปรึกษาการสมัครทุนและเตรียมเอกสาร",
			DashboardTime: time.Date(2025, 7, 28, 0, 0, 0, 0, time.UTC),
			Image:         "https://i.pinimg.com/736x/92/e9/9f/92e99ffbcef0895a3b37eba1a1e78c38.jpg",
		},
		{
			Subject:       "แจ้งซ่อมระบบน้ำบริเวณหอพัก 12-14",
			Information:   "การประปาจะปิดน้ำชั่วคราว วันที่ 15 ก.ค. เวลา 08.00 - 14.00 น.",
			DashboardTime: time.Date(2025, 1, 12, 0, 0, 0, 0, time.UTC),
			Image:         "https://i.pinimg.com/736x/92/e9/9f/92e99ffbcef0895a3b37eba1a1e78c38.jpg",
		},
		{
			Subject:       "รับสมัครนักศึกษาเข้าร่วมกิจกรรม Open House",
			Information:   "เปิดรับนักศึกษาร่วมเป็นวิทยากรนำชมมหาวิทยาลัยให้กับน้อง ม.ปลาย",
			DashboardTime: time.Date(2025, 2, 22, 0, 0, 0, 0, time.UTC),
			Image:         "https://i.pinimg.com/736x/92/e9/9f/92e99ffbcef0895a3b37eba1a1e78c38.jpg",
		},
		{
			Subject:       "เปิดให้บริการ Co-working Space แห่งใหม่",
			Information:   "ห้องทำงานกลุ่มแห่งใหม่ที่อาคารเรียนรวม เปิดให้ใช้แล้ววันนี้!",
			DashboardTime: time.Date(2025, 8, 22, 0, 0, 0, 0, time.UTC),
			Image:         "https://i.pinimg.com/736x/92/e9/9f/92e99ffbcef0895a3b37eba1a1e78c38.jpg",
		},
		{
			Subject:       "ขอเชิญร่วมอบรม Cybersecurity Awareness",
			Information:   "งานไอทีจัดอบรมให้ความรู้ด้านความปลอดภัยบนโลกออนไลน์ (รับชั่วโมงกิจกรรม)",
			DashboardTime: time.Date(2025, 8, 22, 0, 0, 0, 0, time.UTC),
			Image:         "https://i.pinimg.com/736x/92/e9/9f/92e99ffbcef0895a3b37eba1a1e78c38.jpg",
		},
		{
			Subject:       "การแข่งขัน Startup Pitching รอบคัดเลือก",
			Information:   "ชมผลงานนวัตกรรมของนักศึกษาพร้อมลุ้นผู้ชนะตัวแทนไปแข่งขันระดับประเทศ",
			DashboardTime: time.Date(2025, 8, 22, 0, 0, 0, 0, time.UTC),
			Image:         "https://i.pinimg.com/736x/92/e9/9f/92e99ffbcef0895a3b37eba1a1e78c38.jpg",
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
		Email:     "sa@gmail.com",
		Password:  hashedPassword,
		BirthDay:  birthAdmin,
		Profile:   "https://i.pinimg.com/736x/76/b2/ab/76b2abcc22f272d3cd03d4e63f2b75b5.jpg",
		GenderID:  2,
		Role:      "admin",
	}
	db.FirstOrCreate(Admin, &entity.User{Email: "sa@gmail.com"})

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
		Profile:   "https://i.pinimg.com/736x/76/b2/ab/76b2abcc22f272d3cd03d4e63f2b75b5.jpg",
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
