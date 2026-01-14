'use strict';

const fs = require('fs-extra');
const path = require('path');
const mime = require('mime-types');

// Sample data extracted from khaimo.com
const sampleArticles = {
  'thoi-su': [
    { title: 'U23 UAE áp đảo U23 Việt Nam trước trận tứ kết U23 châu Á 2026', slug: 'u23-uae-ap-dao-u23-viet-nam-truoc-tran-tu-ket-u23-chau-a-2026', description: 'U23 UAE được đánh giá cao hơn trong trận đối đầu với U23 Việt Nam tại vòng tứ kết U23 châu Á 2026.' },
    { title: 'Việt Nam làm điều chưa từng có trong lịch sử dự giải U23 châu Á', slug: 'viet-nam-lam-dieu-chua-tung-co-trong-lich-su-du-giai-u23-chau-a', description: 'Đội tuyển U23 Việt Nam đã tạo nên lịch sử mới trong giải đấu U23 châu Á.' },
    { title: 'Rét đậm, rét hại vẫn xuất hiện trong 3 tháng đầu năm 2026', slug: 'ret-dam-ret-hai-van-xuat-hien-trong-3-thang-dau-nam-2026', description: 'Dự báo thời tiết cho thấy rét đậm và rét hại sẽ tiếp tục xuất hiện trong những tháng đầu năm.' },
    { title: 'Nguyễn Hữu Vương bị bắt tạm giam trong vụ án ma túy tại karaoke Venus Quảng Ngãi', slug: 'nguyen-huu-vuong-bi-bat-tam-giam-trong-vu-an-ma-tuy', description: 'Cơ quan chức năng đã bắt tạm giam Nguyễn Hữu Vương liên quan đến vụ án ma túy.' },
    { title: 'Cướp xe máy tại Long Biên bằng hơi cay và vỏ chai bia', slug: 'cuop-xe-may-tai-long-bien-bang-hoi-cay-va-vo-chai-bia', description: 'Nhóm cướp sử dụng hơi cay và vỏ chai bia để cướp xe máy tại quận Long Biên.' },
    { title: 'Iran giữ kênh liên lạc với Mỹ giữa lúc Trump cân nhắc đáp trả', slug: 'iran-giu-kenh-lien-lac-voi-my-giua-luc-trump-can-nhac', description: 'Iran vẫn duy trì kênh liên lạc với Mỹ trong bối cảnh căng thẳng leo thang.' },
    { title: 'Cuba thách thức Mỹ sau tuyên bố của Trump về Venezuela', slug: 'cuba-thach-thuc-my-sau-tuyen-bo-cua-trump-ve-venezuela', description: 'Cuba đáp trả mạnh mẽ sau tuyên bố của Trump về việc chặn dầu từ Venezuela.' },
    { title: 'Miền Bắc sắp đón không khí lạnh rất mạnh, rét đậm diện rộng', slug: 'mien-bac-sap-don-khong-khi-lanh-rat-manh', description: 'Dự báo không khí lạnh mạnh sẽ ảnh hưởng đến miền Bắc trong tuần tới.' },
    { title: 'Hóa chất trong mì sợi vừa bị triệt phá: Borax, Soda, Silicate độc hại', slug: 'hoa-chat-trong-mi-soi-borax-soda-silicate-doc-hai', description: 'Phát hiện hóa chất độc hại trong mì sợi tại cơ sở sản xuất vừa bị triệt phá.' },
    { title: 'Tài khoản ngân hàng mua bán, cho thuê: Phạt tối đa 250 triệu', slug: 'tai-khoan-ngan-hang-mua-ban-cho-thue-phat-250-trieu', description: 'Quy định mới về xử phạt hành vi mua bán, cho thuê tài khoản ngân hàng.' },
  ],
  'the-gioi': [
    { title: 'Cách châu Âu có thể ngăn ông Trump kiểm soát Greenland', slug: 'cach-chau-au-co-the-ngan-trump-kiem-soat-greenland', description: 'Các chuyên gia phân tích những cách châu Âu có thể đối phó với tham vọng của Trump với Greenland.' },
    { title: 'Iran thừa nhận khoảng 2.000 người thiệt mạng trong làn sóng bất ổn', slug: 'iran-thua-nhan-2000-nguoi-thiet-mang-trong-bat-on', description: 'Iran công bố số liệu thiệt mạng trong các cuộc biểu tình trên toàn quốc.' },
    { title: 'Nhân viên Đại sứ quán Nga tại Cyprus tử vong, nghi tự sát', slug: 'nhan-vien-dai-su-quan-nga-tai-cyprus-tu-vong', description: 'Nhân viên ngoại giao Nga được phát hiện tử vong trong văn phòng đại sứ quán.' },
    { title: 'Starlink vẫn giúp người Iran vượt phong tỏa internet', slug: 'starlink-giup-nguoi-iran-vuot-phong-toa-internet', description: 'Dịch vụ internet vệ tinh Starlink tiếp tục hỗ trợ người dân Iran truy cập mạng.' },
    { title: 'Trump tuyên bố áp thuế 25% với các quốc gia làm ăn với Iran', slug: 'trump-tuyen-bo-ap-thue-25-voi-cac-quoc-gia-lam-an-voi-iran', description: 'Tổng thống Trump công bố biện pháp trừng phạt mới nhắm vào các đối tác của Iran.' },
    { title: 'Lễ trưởng thành tại Nhật Bản và thử thách leo thang bộ 60 tầng', slug: 'le-truong-thanh-tai-nhat-ban-thu-thach-leo-60-tang', description: 'Lễ trưởng thành độc đáo với thử thách leo thang bộ tại Nhật Bản.' },
    { title: 'Iran dọa tấn công căn cứ Mỹ và Israel nếu Trump can thiệp', slug: 'iran-doa-tan-cong-can-cu-my-va-israel', description: 'Iran cảnh báo sẽ tấn công các căn cứ quân sự nếu Mỹ can thiệp.' },
    { title: 'EPA đánh giá lại độ an toàn thuốc diệt cỏ paraquat tại Mỹ', slug: 'epa-danh-gia-lai-do-an-toan-thuoc-diet-co-paraquat', description: 'Cơ quan EPA tiến hành đánh giá lại tính an toàn của thuốc diệt cỏ paraquat.' },
    { title: 'Ukraine mở chiến dịch mới nhằm vào Nga, căng thẳng leo thang', slug: 'ukraine-mo-chien-dich-moi-nham-vao-nga', description: 'Ukraine triển khai chiến dịch quân sự mới, căng thẳng với Nga tiếp tục gia tăng.' },
    { title: 'Giá vàng được dự báo tiếp tục tăng tuần này', slug: 'gia-vang-duoc-du-bao-tiep-tuc-tang-tuan-nay', description: 'Các chuyên gia dự báo giá vàng sẽ tiếp tục xu hướng tăng trong tuần.' },
  ],
  'kinh-te': [
    { title: 'Vàng lên gần 4.600 USD, bạc lập đỉnh lịch sử giữa lo ngại Fed', slug: 'vang-len-gan-4600-usd-bac-lap-dinh-lich-su', description: 'Giá vàng và bạc tăng mạnh trong bối cảnh lo ngại về chính sách Fed.' },
    { title: 'Quà quê biến dạng, phí bôi trơn và cái giá của người nghèo', slug: 'qua-que-bien-dang-phi-boi-tron', description: 'Phân tích về hiện tượng quà quê biến tướng và ảnh hưởng đến người nghèo.' },
    { title: 'Giá vàng thế giới vượt 4.600 USD, phố Wall lập kỷ lục', slug: 'gia-vang-the-gioi-vuot-4600-usd-pho-wall-lap-ky-luc', description: 'Thị trường vàng và chứng khoán Mỹ đồng loạt lập kỷ lục mới.' },
    { title: 'Dấu ấn kinh tế thế giới tuần 4-10/1/2026: Cú sốc Venezuela', slug: 'dau-an-kinh-te-the-gioi-tuan-4-10-1-2026', description: 'Tổng hợp các sự kiện kinh tế nổi bật trong tuần qua.' },
    { title: 'Từ 1/3/2026: App ngân hàng tự ngắt nếu thiết bị bị can thiệp', slug: 'app-ngan-hang-tu-ngat-neu-thiet-bi-bi-can-thiep', description: 'Quy định mới về bảo mật cho các ứng dụng ngân hàng di động.' },
    { title: 'Đồ hộp Hạ Long bị yêu cầu truy xuất, triệu hồi lô hàng', slug: 'do-hop-ha-long-bi-yeu-cau-truy-xuat-trieu-hoi', description: 'Sản phẩm đồ hộp Hạ Long bị triệu hồi do không đảm bảo an toàn.' },
    { title: 'Hải Phòng đón sóng đầu tư từ châu Âu nhờ lợi thế cảng biển', slug: 'hai-phong-don-song-dau-tu-tu-chau-au', description: 'Hải Phòng thu hút đầu tư mạnh mẽ từ các doanh nghiệp châu Âu.' },
    { title: 'Chuỗi cafe dừng trà vải Đồ hộp Hạ Long, rà soát nguồn nguyên liệu', slug: 'chuoi-cafe-dung-tra-vai-do-hop-ha-long', description: 'Các chuỗi cafe lớn dừng sử dụng sản phẩm đồ hộp Hạ Long.' },
    { title: 'Chủ động nguồn cung nông sản cho cao điểm cuối năm tại Thanh Hóa', slug: 'chu-dong-nguon-cung-nong-san-thanh-hoa', description: 'Thanh Hóa chuẩn bị nguồn cung nông sản cho dịp cuối năm.' },
    { title: 'Sữa NAN bị gỡ khỏi kệ: Hệ thống bán lẻ rà soát 17 lô thu hồi', slug: 'sua-nan-bi-go-khoi-ke-ra-soat-17-lo-thu-hoi', description: 'Các hệ thống bán lẻ tiến hành thu hồi sữa NAN theo yêu cầu.' },
  ],
  'doi-song': [
    { title: 'Bộ Y tế vào cuộc vụ chùa Cẩm La bị phản ánh nuôi trẻ em trái phép', slug: 'bo-y-te-vao-cuoc-vu-chua-cam-la-nuoi-tre-em-trai-phep', description: 'Bộ Y tế điều tra vụ việc chùa Cẩm La bị tố nuôi trẻ em trái phép.' },
    { title: 'Bác sĩ chỉ cách né "khung giờ tử thần" của đột quỵ buổi sáng sớm', slug: 'bac-si-chi-cach-ne-khung-gio-tu-than-dot-quy', description: 'Các bác sĩ chia sẻ cách phòng tránh đột quỵ vào buổi sáng sớm.' },
    { title: 'Khoa học giải mã cách mỗi người tán tỉnh và khác biệt giới tính', slug: 'khoa-hoc-giai-ma-cach-tan-tinh-khac-biet-gioi-tinh', description: 'Nghiên cứu khoa học về sự khác biệt trong cách tán tỉnh giữa nam và nữ.' },
    { title: 'Cây xạ đen chứa chất ức chế ung thư nhưng không phải ai cũng nên dùng', slug: 'cay-xa-den-chua-chat-uc-che-ung-thu', description: 'Thông tin về tác dụng và hạn chế khi sử dụng cây xạ đen.' },
    { title: '10 giờ phẫu thuật duỗi thẳng lưng cho người cột sống cong', slug: '10-gio-phau-thuat-duoi-thang-lung-cot-song-cong', description: 'Ca phẫu thuật kéo dài 10 giờ để điều trị người bệnh cột sống cong.' },
    { title: 'Cách kiểm tra nợ thuế trước khi đi du lịch tránh bị hoãn xuất cảnh', slug: 'cach-kiem-tra-no-thue-truoc-khi-du-lich', description: 'Hướng dẫn kiểm tra nợ thuế để tránh bị hoãn xuất cảnh.' },
    { title: 'Việt Nam có thể vượt Thái Lan về GDP danh nghĩa từ năm 2026', slug: 'viet-nam-co-the-vuot-thai-lan-ve-gdp-2026', description: 'Dự báo kinh tế cho thấy GDP Việt Nam có thể vượt Thái Lan.' },
    { title: 'Bí quyết giữ sức khỏe trong mùa đông lạnh giá', slug: 'bi-quyet-giu-suc-khoe-trong-mua-dong-lanh-gia', description: 'Các chuyên gia chia sẻ bí quyết giữ sức khỏe trong mùa đông.' },
    { title: 'Xu hướng ẩm thực Việt Nam năm 2026', slug: 'xu-huong-am-thuc-viet-nam-nam-2026', description: 'Các xu hướng ẩm thực mới nổi bật tại Việt Nam.' },
    { title: 'Phong cách sống tối giản đang trở thành xu hướng mới', slug: 'phong-cach-song-toi-gian-xu-huong-moi', description: 'Lối sống tối giản ngày càng được nhiều người Việt ưa chuộng.' },
  ],
  'giao-duc': [
    { title: 'Năm thói quen xấu gây tổn hại não bộ trẻ em, cha mẹ cần điều chỉnh', slug: 'nam-thoi-quen-xau-gay-ton-hai-nao-bo-tre-em', description: 'Các chuyên gia chỉ ra 5 thói quen xấu ảnh hưởng đến não bộ trẻ em.' },
    { title: 'Khiêm nhường – Cội rễ nhân cách và nghệ thuật sống an nhiên', slug: 'khiem-nhuong-coi-re-nhan-cach-nghe-thuat-song', description: 'Bài viết về tầm quan trọng của đức tính khiêm nhường trong cuộc sống.' },
    { title: 'Lần đầu có trường đại học ở tỉnh được chuyển thành đại học', slug: 'lan-dau-truong-dai-hoc-o-tinh-duoc-chuyen-thanh-dai-hoc', description: 'Sự kiện lịch sử trong ngành giáo dục Việt Nam.' },
    { title: 'Người phụ nữ chinh phục Mont Blanc năm 1838', slug: 'nguoi-phu-nu-chinh-phuc-mont-blanc-1838', description: 'Câu chuyện về Henriette d\'Angeville - người phụ nữ chinh phục đỉnh Mont Blanc.' },
    { title: 'Tiền là vị thuốc: Dùng đúng sinh phúc, dùng sai sinh họa', slug: 'tien-la-vi-thuoc-dung-dung-sinh-phuc', description: 'Bài học từ người xưa về cách sử dụng tiền bạc.' },
    { title: 'Những đứa trẻ thành đạt thường có bốn đặc điểm quan trọng', slug: 'nhung-dua-tre-thanh-dat-co-bon-dac-diem', description: 'Nghiên cứu về những đặc điểm của trẻ em thành đạt khi trưởng thành.' },
    { title: 'Đạo hiếu – ngọn đèn thắp sáng hiếu học nơi biển Linh Trường', slug: 'dao-hieu-ngon-den-thap-sang-hieu-hoc', description: 'Câu chuyện về truyền thống hiếu học tại vùng biển Linh Trường.' },
    { title: 'Bao Công có thật sự là vị quan thanh liêm?', slug: 'bao-cong-co-that-su-la-vi-quan-thanh-liem', description: 'Khám phá sự thật lịch sử về quan Bao Công.' },
    { title: 'Nữ sinh Thanh Hóa trúng tuyển thạc sĩ Đại học Thanh Hoa', slug: 'nu-sinh-thanh-hoa-trung-tuyen-thac-si-thanh-hoa', description: 'Câu chuyện truyền cảm hứng về nữ sinh Thanh Hóa.' },
    { title: 'Nâng bước thủ khoa 2025: 98 sinh viên vượt khó gặp gỡ tại TP.HCM', slug: 'nang-buoc-thu-khoa-2025-98-sinh-vien-vuot-kho', description: 'Chương trình hỗ trợ sinh viên thủ khoa vượt khó.' },
  ],
  'van-hoa-the-thao': [
    { title: 'U23 UAE áp đảo U23 Việt Nam trước trận tứ kết U23 châu Á', slug: 'u23-uae-ap-dao-u23-viet-nam-tu-ket-chau-a', description: 'Phân tích sức mạnh hai đội trước trận tứ kết.' },
    { title: 'Duplantis và chiến thuật nhích từng centimet để phá kỷ lục', slug: 'duplantis-chien-thuat-nhich-tung-centimet-pha-ky-luc', description: 'Bí quyết phá kỷ lục của vận động viên nhảy sào Duplantis.' },
    { title: 'U23 Việt Nam thắng Jordan: Báo Hàn Quốc nói về bước ngoặt', slug: 'u23-viet-nam-thang-jordan-bao-han-quoc', description: 'Báo chí Hàn Quốc đánh giá cao chiến thắng của U23 Việt Nam.' },
    { title: 'Fletcher dẫn Man Utd tạm quyền: Hy vọng chiến thắng', slug: 'fletcher-dan-man-utd-tam-quyen-hy-vong-chien-thang', description: 'Darren Fletcher tạm thời dẫn dắt Man United.' },
    { title: 'Jordan đối đầu Việt Nam: Trận ra quân U23 châu Á', slug: 'jordan-doi-dau-viet-nam-tran-ra-quan-u23-chau-a', description: 'Phân tích trước trận đấu giữa Jordan và Việt Nam.' },
    { title: 'Độ hiếm của chiếc đồng hồ 400.000 USD Yamal được tặng', slug: 'do-hiem-dong-ho-400000-usd-yamal-duoc-tang', description: 'Chiếc đồng hồ đặc biệt Yamal được tặng sau chiến thắng.' },
    { title: 'Án phạt U19 và những khoảng tối trong bóng đá trẻ Việt Nam', slug: 'an-phat-u19-khoang-toi-bong-da-tre-viet-nam', description: 'Phân tích về những vấn đề trong bóng đá trẻ Việt Nam.' },
    { title: 'FIFA điều chỉnh phân bổ suất dự U20 World Cup 2027', slug: 'fifa-dieu-chinh-phan-bo-suat-u20-world-cup-2027', description: 'Việt Nam có thêm cơ hội dự U20 World Cup.' },
    { title: 'Birmingham City chìm sâu trong kỷ lục tiêu cực đầu năm', slug: 'birmingham-city-ky-luc-tieu-cuc-dau-nam', description: 'Birmingham City tiếp tục chuỗi thành tích tiêu cực.' },
    { title: 'Mường Đủ – Miền quê gìn giữ văn hóa Mường', slug: 'muong-du-mien-que-gin-giu-van-hoa-muong', description: 'Khám phá văn hóa Mường tại Thanh Hóa.' },
  ],
  'khai-quang': [
    { title: 'Bí ẩn những ngôi đền cổ ở Việt Nam', slug: 'bi-an-nhung-ngoi-den-co-o-viet-nam', description: 'Khám phá những bí ẩn về các ngôi đền cổ tại Việt Nam.' },
    { title: 'Những hiện tượng tâm linh kỳ bí tại Việt Nam', slug: 'nhung-hien-tuong-tam-linh-ky-bi-tai-viet-nam', description: 'Tìm hiểu về các hiện tượng tâm linh được ghi nhận tại Việt Nam.' },
    { title: 'Phong thủy và cách bài trí nhà cửa đón lộc đầu năm', slug: 'phong-thuy-bai-tri-nha-cua-don-loc-dau-nam', description: 'Hướng dẫn bài trí nhà cửa theo phong thủy đón năm mới.' },
    { title: 'Giải mã những giấc mơ phổ biến nhất', slug: 'giai-ma-nhung-giac-mo-pho-bien-nhat', description: 'Ý nghĩa của những giấc mơ thường gặp trong cuộc sống.' },
    { title: 'Những địa điểm tâm linh nổi tiếng nhất Việt Nam', slug: 'nhung-dia-diem-tam-linh-noi-tieng-nhat-viet-nam', description: 'Danh sách các địa điểm tâm linh thu hút nhiều du khách.' },
    { title: 'Cách cúng ông Công ông Táo chuẩn theo phong tục', slug: 'cach-cung-ong-cong-ong-tao-chuan-phong-tuc', description: 'Hướng dẫn cúng ông Công ông Táo theo phong tục truyền thống.' },
    { title: 'Những điều kiêng kỵ trong ngày Tết Nguyên Đán', slug: 'nhung-dieu-kieng-ky-trong-ngay-tet-nguyen-dan', description: 'Những điều cần tránh trong dịp Tết để may mắn cả năm.' },
    { title: 'Ý nghĩa của 12 con giáp trong văn hóa Việt', slug: 'y-nghia-cua-12-con-giap-trong-van-hoa-viet', description: 'Tìm hiểu ý nghĩa của từng con giáp trong văn hóa Việt Nam.' },
    { title: 'Phong tục đón Tết độc đáo của các dân tộc thiểu số', slug: 'phong-tuc-don-tet-doc-dao-cua-dan-toc-thieu-so', description: 'Khám phá phong tục đón Tết của các dân tộc thiểu số.' },
    { title: 'Bí quyết xem tuổi hợp mệnh trong năm mới', slug: 'bi-quyet-xem-tuoi-hop-menh-trong-nam-moi', description: 'Hướng dẫn xem tuổi và mệnh để có một năm mới thuận lợi.' },
  ],
};

async function seedExampleApp() {
  const shouldImportSeedData = await isFirstRun();

  if (shouldImportSeedData) {
    try {
      console.log('Setting up the template with sample data from khaimo.com...');
      await importSeedData();
      console.log('Ready to go');
    } catch (error) {
      console.log('Could not import seed data');
      console.error(error);
    }
  } else {
    console.log(
      'Seed data has already been imported. We cannot reimport unless you clear your database first.'
    );
  }
}

async function isFirstRun() {
  const pluginStore = strapi.store({
    environment: strapi.config.environment,
    type: 'type',
    name: 'setup',
  });
  const initHasRun = await pluginStore.get({ key: 'initHasRun' });
  await pluginStore.set({ key: 'initHasRun', value: true });
  return !initHasRun;
}

async function setPublicPermissions(newPermissions) {
  const publicRole = await strapi.query('plugin::users-permissions.role').findOne({
    where: { type: 'public' },
  });

  const allPermissionsToCreate = [];
  Object.keys(newPermissions).map((controller) => {
    const actions = newPermissions[controller];
    const permissionsToCreate = actions.map((action) => {
      return strapi.query('plugin::users-permissions.permission').create({
        data: {
          action: `api::${controller}.${controller}.${action}`,
          role: publicRole.id,
        },
      });
    });
    allPermissionsToCreate.push(...permissionsToCreate);
  });
  await Promise.all(allPermissionsToCreate);
}

async function createEntry({ model, entry }) {
  try {
    await strapi.documents(`api::${model}.${model}`).create({
      data: entry,
    });
    console.log(`  ✓ Created ${model}: ${entry.title || entry.name || 'entry'}`);
  } catch (error) {
    console.error(`  ✗ Failed to create ${model}:`, error.message);
  }
}

async function importCategoryArticles(categoryApiName, displayName) {
  console.log(`\nImporting ${displayName} articles...`);
  const articles = sampleArticles[categoryApiName] || [];
  
  for (const article of articles) {
    await createEntry({
      model: categoryApiName,
      entry: {
        ...article,
        publishedAt: new Date().toISOString(),
        Block: [
          {
            __component: 'shared.rich-text',
            body: `<p>${article.description}</p><p>Đây là nội dung mẫu được tạo tự động để thử nghiệm hệ thống. Nội dung thực sẽ được cập nhật sau.</p><p>Nguồn tham khảo: khaimo.com</p>`,
          },
        ],
      },
    });
  }
}

async function importSeedData() {
  console.log('Setting up public permissions...');
  
  // Set up public permissions for all content types
  await setPublicPermissions({
    article: ['find', 'findOne'],
    category: ['find', 'findOne'],
    author: ['find', 'findOne'],
    global: ['find', 'findOne'],
    about: ['find', 'findOne'],
    homepage: ['find', 'findOne'],
    'thoi-su': ['find', 'findOne'],
    'the-gioi': ['find', 'findOne'],
    'kinh-te': ['find', 'findOne'],
    'doi-song': ['find', 'findOne'],
    'giao-duc': ['find', 'findOne'],
    'van-hoa-the-thao': ['find', 'findOne'],
    'khai-quang': ['find', 'findOne'],
  });

  // Import articles for each category
  await importCategoryArticles('thoi-su', 'Thời Sự');
  await importCategoryArticles('the-gioi', 'Thế Giới');
  await importCategoryArticles('kinh-te', 'Kinh Tế');
  await importCategoryArticles('doi-song', 'Đời Sống');
  await importCategoryArticles('giao-duc', 'Giáo Dục');
  await importCategoryArticles('van-hoa-the-thao', 'Văn Hoá Thể Thao');
  await importCategoryArticles('khai-quang', 'Khai Quang');

  console.log('\n✅ All sample data imported successfully!');
}

async function main() {
  const { createStrapi, compileStrapi } = require('@strapi/strapi');

  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();

  app.log.level = 'error';

  await seedExampleApp();
  await app.destroy();

  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
