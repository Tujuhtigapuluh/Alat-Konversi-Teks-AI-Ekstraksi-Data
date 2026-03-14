// ============================================================
// AI Text Humanizer — Memanusiakan teks AI agar lolos Turnitin
// ============================================================

export type HumanizeLevel = 'light' | 'medium' | 'heavy';

export interface HumanizeResult {
  text: string;
  changes: number;
  originalWordCount: number;
  newWordCount: number;
  similarityEstimate: number; // estimated % of text that changed
}

// ---- INDONESIAN SYNONYM MAP (kata → alternatif) ----
const SYNONYM_MAP: Record<string, string[]> = {
  'penting': ['krusial', 'signifikan', 'esensial', 'vital', 'bermakna'],
  'sangat': ['amat', 'begitu', 'sungguh', 'luar biasa', 'teramat'],
  'menggunakan': ['memakai', 'memanfaatkan', 'menerapkan', 'mengaplikasikan', 'mempergunakan'],
  'digunakan': ['dipakai', 'dimanfaatkan', 'diterapkan', 'diaplikasikan', 'dipergunakan'],
  'penggunaan': ['pemakaian', 'pemanfaatan', 'penerapan', 'pengaplikasian'],
  'melakukan': ['menjalankan', 'mengerjakan', 'menyelenggarakan', 'mengeksekusi', 'menempuh'],
  'dilakukan': ['dijalankan', 'dikerjakan', 'diselenggarakan', 'ditempuh', 'dieksekusi'],
  'memberikan': ['menyajikan', 'menyediakan', 'menghadirkan', 'menyuguhkan', 'menawarkan'],
  'diberikan': ['disajikan', 'disediakan', 'dihadirkan', 'ditawarkan'],
  'mendapatkan': ['memperoleh', 'meraih', 'menggapai', 'menemukan'],
  'didapatkan': ['diperoleh', 'diraih', 'ditemukan'],
  'mempunyai': ['memiliki', 'mengandung', 'menyimpan', 'punya'],
  'memiliki': ['mempunyai', 'mengandung', 'menyimpan', 'punya'],
  'menunjukkan': ['memperlihatkan', 'mengindikasikan', 'membuktikan', 'menegaskan', 'mencerminkan'],
  'ditunjukkan': ['diperlihatkan', 'diindikasikan', 'dibuktikan', 'dicerminkan'],
  'meningkatkan': ['menaikkan', 'mendongkrak', 'memajukan', 'mengembangkan', 'memperbaiki'],
  'ditingkatkan': ['dinaikkan', 'dikembangkan', 'diperbaiki', 'dimajukan'],
  'peningkatan': ['kenaikan', 'perkembangan', 'kemajuan', 'pertumbuhan', 'eskalasi'],
  'menurunkan': ['mengurangi', 'memperkecil', 'menekan', 'mengecilkan'],
  'penurunan': ['pengurangan', 'kemunduran', 'degradasi', 'kemerosotan'],
  'mempengaruhi': ['memengaruhi', 'berdampak pada', 'berpengaruh terhadap', 'memiliki efek pada'],
  'dipengaruhi': ['dipengaruhi oleh', 'terdampak oleh', 'terpengaruh oleh'],
  'pengaruh': ['dampak', 'efek', 'imbas', 'implikasi', 'konsekuensi'],
  'dampak': ['pengaruh', 'efek', 'imbas', 'implikasi', 'konsekuensi'],
  'membantu': ['mendukung', 'memfasilitasi', 'mempermudah', 'berkontribusi pada'],
  'memastikan': ['menjamin', 'menggaransi', 'memverifikasi', 'mengonfirmasi'],
  'dipahami': ['dimengerti', 'diketahui', 'dicerna', 'dimaknai'],
  'memahami': ['mengerti', 'mengetahui', 'mencerna', 'memaknai', 'mendalami'],
  'pemahaman': ['pengertian', 'pengetahuan', 'wawasan', 'komprehensi'],
  'berbagai': ['beragam', 'bermacam-macam', 'aneka', 'sejumlah', 'banyak'],
  'beberapa': ['sejumlah', 'sebagian', 'sekian', 'beragam'],
  'seluruh': ['semua', 'segenap', 'keseluruhan', 'total'],
  'selain itu': ['di samping itu', 'lebih dari itu', 'tidak hanya itu', 'tambahan lagi'],
  'oleh karena itu': ['maka dari itu', 'sehubungan dengan itu', 'atas dasar itu', 'dengan demikian'],
  'dengan demikian': ['oleh sebab itu', 'maka dari itu', 'jadi', 'karena hal tersebut'],
  'namun': ['akan tetapi', 'meskipun demikian', 'kendati demikian', 'walaupun begitu', 'tetapi'],
  'tetapi': ['akan tetapi', 'namun demikian', 'meskipun begitu', 'walaupun demikian'],
  'sehingga': ['akibatnya', 'yang mengakibatkan', 'yang berujung pada', 'sampai-sampai'],
  'kemudian': ['selanjutnya', 'lalu', 'sesudah itu', 'setelah itu', 'berikutnya'],
  'selanjutnya': ['kemudian', 'lalu', 'berikutnya', 'sesudah itu'],
  'berdasarkan': ['merujuk pada', 'mengacu pada', 'berpijak pada', 'berlandaskan', 'bertumpu pada'],
  'menurut': ['sebagaimana dikemukakan', 'seperti yang dinyatakan', 'sebagaimana pendapat', 'sesuai pandangan'],
  'terdapat': ['ada', 'dijumpai', 'ditemukan', 'tersedia'],
  'merupakan': ['adalah', 'ialah', 'menjadi', 'termasuk'],
  'adalah': ['merupakan', 'ialah', 'yakni', 'yaitu'],
  'yakni': ['yaitu', 'ialah', 'adalah', 'tepatnya'],
  'bertujuan': ['bermaksud', 'dimaksudkan', 'berorientasi pada', 'ditujukan'],
  'tujuan': ['sasaran', 'target', 'maksud', 'arah', 'orientasi'],
  'masalah': ['persoalan', 'problematika', 'isu', 'permasalahan', 'tantangan'],
  'permasalahan': ['persoalan', 'problematika', 'isu', 'masalah', 'kendala'],
  'solusi': ['jalan keluar', 'penyelesaian', 'pemecahan', 'resolusi', 'jawaban'],
  'metode': ['cara', 'teknik', 'pendekatan', 'strategi', 'prosedur'],
  'strategi': ['pendekatan', 'cara', 'langkah', 'metode', 'taktik'],
  'proses': ['tahapan', 'rangkaian', 'mekanisme', 'alur', 'langkah-langkah'],
  'hasil': ['temuan', 'luaran', 'output', 'capaian', 'perolehan'],
  'penelitian': ['riset', 'studi', 'kajian', 'investigasi', 'telaah'],
  'studi': ['penelitian', 'riset', 'kajian', 'telaah'],
  'analisis': ['telaah', 'kajian', 'penguraian', 'pembahasan mendalam', 'evaluasi'],
  'evaluasi': ['penilaian', 'pengkajian', 'peninjauan', 'asesmen'],
  'kesimpulan': ['simpulan', 'konklusi', 'inferensi', 'rangkuman akhir'],
  'menjelaskan': ['menguraikan', 'memaparkan', 'mendeskripsikan', 'mengungkapkan', 'merincikan'],
  'dijelaskan': ['diuraikan', 'dipaparkan', 'dideskripsikan', 'diungkapkan'],
  'menyatakan': ['mengungkapkan', 'mengemukakan', 'mengutarakan', 'menyebutkan'],
  'dinyatakan': ['diungkapkan', 'dikemukakan', 'diutarakan', 'disebutkan'],
  'menyebutkan': ['mengungkapkan', 'mengutarakan', 'menyinggung', 'mengemukakan'],
  'disebutkan': ['dikemukakan', 'diungkapkan', 'diutarakan', 'disinggung'],
  'menggambarkan': ['melukiskan', 'mendeskripsikan', 'mengilustrasikan', 'memotret'],
  'digambarkan': ['dilukiskan', 'dideskripsikan', 'diilustrasikan'],
  'menghasilkan': ['memproduksi', 'melahirkan', 'membuahkan', 'menciptakan'],
  'dihasilkan': ['diproduksi', 'dilahirkan', 'diciptakan', 'dimunculkan'],
  'menciptakan': ['membuat', 'menghasilkan', 'melahirkan', 'membangun', 'merancang'],
  'diciptakan': ['dibuat', 'dihasilkan', 'dilahirkan', 'dibangun', 'dirancang'],
  'mengembangkan': ['membangun', 'merancang', 'menyusun', 'mengonstruksi', 'memperluas'],
  'dikembangkan': ['dibangun', 'dirancang', 'disusun', 'diperluas'],
  'perkembangan': ['kemajuan', 'pertumbuhan', 'evolusi', 'dinamika', 'progres'],
  'menyediakan': ['menyiapkan', 'mengadakan', 'menyuplai', 'memfasilitasi'],
  'disediakan': ['disiapkan', 'diadakan', 'disuplai', 'difasilitasi'],
  'memerlukan': ['membutuhkan', 'mensyaratkan', 'menghendaki', 'perlu'],
  'diperlukan': ['dibutuhkan', 'disyaratkan', 'dikehendaki'],
  'menerapkan': ['mengimplementasikan', 'mempraktikkan', 'mengaplikasikan', 'mengeksekusi'],
  'diterapkan': ['diimplementasikan', 'dipraktikkan', 'diaplikasikan'],
  'penerapan': ['implementasi', 'praktik', 'aplikasi', 'pelaksanaan'],
  'implementasi': ['penerapan', 'pelaksanaan', 'pengaplikasian', 'realisasi'],
  'efektif': ['ampuh', 'manjur', 'berdaya guna', 'berhasil guna', 'tepat sasaran'],
  'efisien': ['hemat', 'berdaya guna', 'optimal', 'produktif'],
  'signifikan': ['bermakna', 'berarti', 'substansial', 'penting', 'mencolok'],
  'relevan': ['sesuai', 'terkait', 'berkaitan', 'berhubungan', 'cocok'],
  'optimal': ['terbaik', 'maksimal', 'ideal', 'paling efektif'],
  'komprehensif': ['menyeluruh', 'lengkap', 'mendalam', 'holistik', 'utuh'],
  'kontribusi': ['sumbangan', 'andil', 'peran serta', 'partisipasi'],
  'berkontribusi': ['berperan', 'turut andil', 'memberikan sumbangan', 'berpartisipasi'],
  'aspek': ['segi', 'dimensi', 'sudut pandang', 'faset', 'unsur'],
  'faktor': ['unsur', 'komponen', 'elemen', 'variabel', 'penyebab'],
  'komponen': ['unsur', 'bagian', 'elemen', 'faktor'],
  'konteks': ['situasi', 'keadaan', 'kondisi', 'latar belakang', 'setting'],
  'fenomena': ['gejala', 'peristiwa', 'kejadian', 'realitas'],
  'paradigma': ['cara pandang', 'kerangka pikir', 'sudut pandang', 'perspektif'],
  'perspektif': ['sudut pandang', 'cara pandang', 'pandangan', 'optik'],
  'konsep': ['gagasan', 'ide', 'pemikiran', 'rancangan'],
  'teori': ['konsep', 'kerangka pemikiran', 'hipotesis', 'postulat'],
  'karakteristik': ['ciri', 'sifat', 'kekhasan', 'atribut', 'fitur'],
  'indikator': ['penanda', 'petunjuk', 'tolok ukur', 'parameter'],
  'parameter': ['tolok ukur', 'patokan', 'standar', 'kriteria', 'acuan'],
  'kriteria': ['syarat', 'standar', 'patokan', 'tolok ukur', 'ukuran'],
  'secara': ['dengan cara', 'melalui', 'lewat'],
  'terhadap': ['atas', 'kepada', 'pada', 'mengenai'],
  'pada dasarnya': ['intinya', 'hakikatnya', 'sejatinya', 'pada prinsipnya'],
  'dalam hal ini': ['terkait hal ini', 'berkenaan dengan ini', 'perihal ini', 'sehubungan dengan hal ini'],
  'di sisi lain': ['sebaliknya', 'dari sisi lain', 'pada saat bersamaan', 'dari perspektif lain'],
  'pada akhirnya': ['ujung-ujungnya', 'pada penghujungnya', 'akhir kata', 'sebagai penutup'],
  'secara keseluruhan': ['secara umum', 'secara garis besar', 'pada umumnya', 'secara menyeluruh'],
  'secara signifikan': ['secara bermakna', 'secara mencolok', 'secara substansial', 'secara nyata'],
  'secara efektif': ['dengan efektif', 'secara berdaya guna', 'dengan tepat guna'],
  'memfasilitasi': ['mempermudah', 'mendukung', 'membantu', 'melancarkan'],
  'mengidentifikasi': ['mengenali', 'menemukan', 'menandai', 'merumuskan'],
  'diidentifikasi': ['dikenali', 'ditemukan', 'ditandai', 'dirumuskan'],
  'mengintegrasikan': ['memadukan', 'menggabungkan', 'menyatukan', 'mengombinasikan'],
  'diintegrasikan': ['dipadukan', 'digabungkan', 'disatukan', 'dikombinasikan'],
  'mengoptimalkan': ['memaksimalkan', 'menyempurnakan', 'memaksimumkan'],
  'dioptimalkan': ['dimaksimalkan', 'disempurnakan', 'ditingkatkan'],
  'menganalisis': ['menelaah', 'mengkaji', 'menguraikan', 'mengevaluasi', 'mempelajari'],
  'dianalisis': ['ditelaah', 'dikaji', 'diuraikan', 'dievaluasi', 'dipelajari'],
  'mengkaji': ['menelaah', 'meneliti', 'mempelajari', 'menganalisis'],
  'dikaji': ['ditelaah', 'diteliti', 'dipelajari', 'dianalisis'],
  'menyimpulkan': ['mengambil kesimpulan', 'menarik konklusi', 'merumuskan', 'menginferensikan'],
  'disimpulkan': ['ditarik kesimpulan', 'dikonklusikan', 'dirumuskan'],
  'mengacu': ['merujuk', 'berpedoman', 'bersandar', 'mengikuti'],
  'bertanggung jawab': ['berkewajiban', 'memikul tanggung jawab', 'bertugas'],
  'berkembang': ['tumbuh', 'maju', 'meningkat', 'progresif'],
  'lingkungan': ['situasi sekitar', 'ekosistem', 'suasana', 'habitat'],
  'masyarakat': ['publik', 'khalayak', 'warga', 'komunitas'],
  'individu': ['perorangan', 'pribadi', 'seseorang', 'person'],
  'organisasi': ['lembaga', 'institusi', 'badan', 'entitas'],
  'teknologi': ['inovasi teknis', 'perangkat modern', 'sistem digital'],
  'informasi': ['data', 'keterangan', 'kabar', 'berita'],
  'komunikasi': ['interaksi', 'pertukaran informasi', 'dialog', 'kontak'],
  'aktivitas': ['kegiatan', 'aksi', 'tindakan', 'pekerjaan'],
  'kegiatan': ['aktivitas', 'aksi', 'langkah', 'program'],
  'kondisi': ['keadaan', 'situasi', 'suasana', 'state'],
  'situasi': ['kondisi', 'keadaan', 'suasana', 'konteks'],
  'kemampuan': ['kapabilitas', 'kompetensi', 'kapasitas', 'keahlian', 'kecakapan'],
  'keterampilan': ['keahlian', 'kemahiran', 'kecakapan', 'skill'],
  'hubungan': ['relasi', 'kaitan', 'keterkaitan', 'koneksi', 'interaksi'],
  'kualitas': ['mutu', 'bobot', 'derajat', 'level'],
  'kuantitas': ['jumlah', 'banyaknya', 'volume', 'besaran'],
  'mekanisme': ['sistem kerja', 'tata cara', 'prosedur', 'alur kerja'],
  'infrastruktur': ['sarana prasarana', 'fasilitas', 'fondasi'],
  'sumber daya': ['aset', 'modal', 'potensi', 'kapital'],
  'kebijakan': ['regulasi', 'aturan', 'ketentuan', 'peraturan'],
  'program': ['rencana', 'inisiatif', 'proyek', 'rancangan'],
  'potensi': ['kemungkinan', 'peluang', 'prospek', 'daya'],
  'tantangan': ['hambatan', 'kendala', 'rintangan', 'persoalan'],
  'peluang': ['kesempatan', 'prospek', 'potensi', 'ruang'],
  'motivasi': ['dorongan', 'semangat', 'stimulus', 'rangsangan'],
  'inovasi': ['terobosan', 'pembaruan', 'kreasi baru', 'gagasan baru'],
  'kolaborasi': ['kerja sama', 'kemitraan', 'sinergi', 'kooperasi'],
  'transformasi': ['perubahan', 'metamorfosis', 'penjelmaan', 'evolusi'],
  'signifikansi': ['arti penting', 'kebermaknaan', 'bobot', 'urgensi'],
};

// ---- ENGLISH SYNONYM MAP ----
const ENGLISH_SYNONYM_MAP: Record<string, string[]> = {
  'important': ['crucial', 'significant', 'essential', 'vital', 'critical'],
  'very': ['quite', 'rather', 'particularly', 'notably', 'considerably'],
  'use': ['employ', 'utilize', 'apply', 'leverage', 'adopt'],
  'used': ['employed', 'utilized', 'applied', 'adopted', 'leveraged'],
  'using': ['employing', 'utilizing', 'applying', 'leveraging'],
  'help': ['assist', 'support', 'aid', 'facilitate', 'enable'],
  'helps': ['assists', 'supports', 'aids', 'facilitates', 'enables'],
  'show': ['demonstrate', 'indicate', 'reveal', 'illustrate', 'display'],
  'shows': ['demonstrates', 'indicates', 'reveals', 'illustrates', 'displays'],
  'however': ['nevertheless', 'yet', 'still', 'on the other hand', 'that said'],
  'therefore': ['consequently', 'as a result', 'thus', 'hence', 'accordingly'],
  'additionally': ['moreover', 'furthermore', 'besides', 'also', 'on top of that'],
  'furthermore': ['moreover', 'in addition', 'besides', 'what is more'],
  'moreover': ['furthermore', 'in addition', 'besides', 'additionally'],
  'significant': ['notable', 'considerable', 'substantial', 'meaningful', 'marked'],
  'various': ['diverse', 'multiple', 'several', 'numerous', 'assorted'],
  'provide': ['offer', 'supply', 'deliver', 'furnish', 'present'],
  'provides': ['offers', 'supplies', 'delivers', 'furnishes', 'presents'],
  'ensure': ['guarantee', 'confirm', 'verify', 'make certain', 'ascertain'],
  'obtain': ['acquire', 'gain', 'secure', 'get', 'attain'],
  'achieve': ['accomplish', 'attain', 'reach', 'realize', 'fulfill'],
  'demonstrate': ['show', 'illustrate', 'exhibit', 'prove', 'manifest'],
  'implement': ['execute', 'carry out', 'put into practice', 'enact', 'realize'],
  'analyze': ['examine', 'investigate', 'study', 'assess', 'evaluate'],
  'enhance': ['improve', 'boost', 'strengthen', 'augment', 'elevate'],
  'indicate': ['suggest', 'point to', 'signal', 'imply', 'denote'],
  'determine': ['establish', 'ascertain', 'identify', 'figure out', 'pinpoint'],
  'contribute': ['add to', 'play a role in', 'lend to', 'factor into'],
  'facilitate': ['enable', 'support', 'expedite', 'streamline', 'simplify'],
  'crucial': ['vital', 'essential', 'critical', 'pivotal', 'key'],
  'comprehensive': ['thorough', 'complete', 'extensive', 'all-encompassing', 'in-depth'],
  'effective': ['successful', 'productive', 'efficient', 'capable', 'potent'],
  'approach': ['method', 'strategy', 'technique', 'way', 'tactic'],
  'impact': ['effect', 'influence', 'consequence', 'outcome', 'result'],
  'process': ['procedure', 'method', 'mechanism', 'workflow', 'operation'],
  'result': ['outcome', 'finding', 'consequence', 'effect', 'product'],
  'research': ['study', 'investigation', 'inquiry', 'exploration', 'examination'],
  'method': ['technique', 'approach', 'procedure', 'way', 'system'],
  'development': ['growth', 'progress', 'advancement', 'evolution', 'expansion'],
  'environment': ['setting', 'surroundings', 'context', 'milieu', 'atmosphere'],
  'individual': ['person', 'someone', 'a person', 'one'],
  'community': ['group', 'society', 'population', 'collective'],
  'challenge': ['obstacle', 'difficulty', 'hurdle', 'problem', 'issue'],
  'opportunity': ['chance', 'prospect', 'opening', 'possibility'],
  'strategy': ['plan', 'approach', 'tactic', 'scheme', 'blueprint'],
  'innovation': ['breakthrough', 'novelty', 'new idea', 'advancement'],
};

// ---- AI PHRASE PATTERNS (kalimat khas AI) ----
const AI_PHRASE_REPLACEMENTS: [RegExp, string[]][] = [
  // Indonesian AI patterns
  [/\bDalam konteks ini\b/gi, ['Berkaitan dengan hal tersebut', 'Terkait dengan ini', 'Merujuk pada hal ini', 'Menyangkut hal ini']],
  [/\bPerlu dicatat bahwa\b/gi, ['Patut digarisbawahi bahwa', 'Hal yang perlu diperhatikan adalah', 'Satu hal yang menarik adalah', 'Yang tidak boleh diabaikan adalah']],
  [/\bPenting untuk dicatat\b/gi, ['Hal yang patut diperhatikan', 'Perlu menjadi perhatian', 'Yang menarik untuk diamati']],
  [/\bDengan kata lain\b/gi, ['Sederhananya', 'Maksudnya', 'Dapat dimaknai bahwa', 'Artinya']],
  [/\bSecara umum\b/gi, ['Pada umumnya', 'Lazimnya', 'Biasanya', 'Secara garis besar', 'Dalam banyak kasus']],
  [/\bHal ini menunjukkan bahwa\b/gi, ['Ini mengindikasikan bahwa', 'Fakta ini membuktikan bahwa', 'Dari sini terlihat bahwa', 'Ini menegaskan bahwa']],
  [/\bDapat disimpulkan bahwa\b/gi, ['Dari pembahasan di atas, terlihat bahwa', 'Maka bisa ditarik benang merah bahwa', 'Hal ini mengarah pada simpulan bahwa', 'Berdasarkan uraian tersebut, tampak bahwa']],
  [/\bPada dasarnya\b/gi, ['Intinya', 'Hakikatnya', 'Sejatinya', 'Pada prinsipnya', 'Pada hakikatnya']],
  [/\bDi sisi lain\b/gi, ['Sebaliknya', 'Dari sisi lain', 'Namun di lain pihak', 'Dari perspektif lain']],
  [/\bSebagai contoh\b/gi, ['Misalnya', 'Ambil contoh', 'Contohnya', 'Salah satu contohnya']],
  [/\bTentu saja\b/gi, ['Sudah pasti', 'Tak diragukan lagi', 'Tanpa keraguan', 'Memang benar']],
  [/\bHal ini disebabkan oleh\b/gi, ['Penyebabnya adalah', 'Ini terjadi karena', 'Faktor di balik ini adalah', 'Ini bermula dari']],
  [/\bHal ini dikarenakan\b/gi, ['Ini terjadi lantaran', 'Penyebabnya ialah', 'Ini berlangsung karena']],
  [/\bDalam rangka\b/gi, ['Untuk keperluan', 'Guna', 'Demi', 'Dalam upaya']],
  [/\bAdapun\b/gi, ['Sementara itu', 'Sedangkan', 'Terkait dengan itu']],
  [/\bTidak dapat dipungkiri bahwa\b/gi, ['Kenyataannya', 'Fakta menunjukkan bahwa', 'Tidak bisa disangkal bahwa', 'Realitanya']],
  [/\bPada kenyataannya\b/gi, ['Faktanya', 'Realitanya', 'Dalam kenyataan', 'Sebetulnya']],
  [/\bSangat penting untuk\b/gi, ['Amat krusial untuk', 'Sangat esensial untuk', 'Begitu penting bagi', 'Merupakan hal vital untuk']],
  [/\bMerupakan salah satu\b/gi, ['Termasuk', 'Menjadi bagian dari', 'Bisa dikategorikan sebagai']],
  [/\bBerbagai macam\b/gi, ['Beragam jenis', 'Aneka ragam', 'Bermacam-macam', 'Sejumlah variasi']],
  [/\bSelain itu,?\s*/gi, ['Di samping itu, ', 'Lebih lanjut, ', 'Tidak hanya itu, ', 'Tambahan pula, ', 'Lebih dari itu, ']],
  [/\bOleh karena itu,?\s*/gi, ['Maka dari itu, ', 'Atas dasar itu, ', 'Konsekuensinya, ', 'Karena hal tersebut, ']],
  [/\bDengan demikian,?\s*/gi, ['Oleh sebab itu, ', 'Jadi, ', 'Maka, ', 'Karena hal tersebut, ']],
  [/\bNamun demikian,?\s*/gi, ['Walaupun begitu, ', 'Meskipun demikian, ', 'Kendati begitu, ', 'Akan tetapi, ']],
  [/\bSebagaimana telah disebutkan\b/gi, ['Seperti yang sudah diulas', 'Sesuai bahasan sebelumnya', 'Mengacu pada pembahasan di atas']],
  [/\bBerdasarkan hal tersebut\b/gi, ['Mengacu pada hal itu', 'Bertolak dari hal tersebut', 'Berpijak pada itu']],
  [/\bMaka dari itu\b/gi, ['Oleh karena itu', 'Sehubungan dengan itu', 'Atas dasar tersebut']],
  [/\bPada akhirnya\b/gi, ['Pada penghujungnya', 'Di ujung cerita', 'Akhir kata', 'Pada titik akhir']],

  // English AI patterns
  [/\bIt is worth noting that\b/gi, ['Notably', 'One should note that', 'An interesting point is that', 'What stands out is that']],
  [/\bIt is important to note that\b/gi, ['Notably', 'A key point here is that', 'What deserves attention is that']],
  [/\bIn conclusion\b/gi, ['To sum up', 'All things considered', 'Taking everything into account', 'In the final analysis']],
  [/\bIn summary\b/gi, ['To summarize', 'Briefly put', 'In a nutshell', 'The bottom line is']],
  [/\bMoreover,?\s*/gi, ['What is more, ', 'On top of that, ', 'In addition, ', 'Plus, ']],
  [/\bFurthermore,?\s*/gi, ['Besides, ', 'In addition, ', 'Also, ', 'Adding to that, ']],
  [/\bAdditionally,?\s*/gi, ['On top of that, ', 'Also, ', 'Plus, ', 'Besides that, ']],
  [/\bConsequently,?\s*/gi, ['As a result, ', 'Because of that, ', 'This means that ', 'Owing to this, ']],
  [/\bNevertheless,?\s*/gi, ['Even so, ', 'Still, ', 'Yet, ', 'That said, ', 'Be that as it may, ']],
  [/\bIn this context\b/gi, ['In this regard', 'On this matter', 'Concerning this', 'With respect to this']],
  [/\bIt is essential to\b/gi, ['One must', 'We need to', 'It becomes necessary to', 'There is a need to']],
  [/\bPlays a crucial role\b/gi, ['is key', 'is central', 'is vital', 'matters greatly']],
  [/\bA wide range of\b/gi, ['Many different', 'An array of', 'A broad spectrum of', 'Numerous']],
  [/\bIn order to\b/gi, ['To', 'So as to', 'With the aim of', 'For the purpose of']],
  [/\bDue to the fact that\b/gi, ['Because', 'Since', 'Given that', 'As']],
  [/\bIt can be concluded that\b/gi, ['The evidence points to', 'This suggests that', 'One can infer that', 'The findings indicate that']],
  [/\bIt should be noted that\b/gi, ['Worth mentioning is that', 'One thing to keep in mind is that', 'An important detail is that']],
];

// ---- SENTENCE STARTERS KHAS AI YANG HARUS DIUBAH ----
const AI_SENTENCE_STARTERS: [RegExp, string[]][] = [
  [/^Secara keseluruhan, /i, ['Pada umumnya, ', 'Secara garis besar, ', 'Jika dilihat secara menyeluruh, ']],
  [/^Penting untuk dipahami bahwa /i, ['Perlu kita sadari bahwa ', 'Hal yang mesti dipahami ialah ', 'Yang perlu digarisbawahi, ']],
  [/^Sebagai kesimpulan, /i, ['Untuk merangkum, ', 'Akhir kata, ', 'Jadi intinya, ', 'Ringkasnya, ']],
  [/^Dengan adanya /i, ['Keberadaan ', 'Hadirnya ', 'Munculnya ']],
  [/^Berdasarkan penelitian, /i, ['Riset menunjukkan bahwa ', 'Studi yang ada memperlihatkan ', 'Hasil kajian membuktikan ']],
  [/^Berdasarkan data, /i, ['Data memperlihatkan bahwa ', 'Fakta di lapangan menunjukkan ', 'Angka-angka membuktikan ']],
  [/^In today's world, /i, ['Nowadays, ', 'These days, ', 'In the current landscape, ']],
  [/^In today's digital age, /i, ['In the modern era, ', 'With current technology, ', 'As things stand today, ']],
  [/^Overall, /i, ['All in all, ', 'On the whole, ', 'By and large, ', 'Looking at the bigger picture, ']],
];

// ---- FILLER/TRANSITION HUMANIZERS ----
const HUMAN_TRANSITIONS_ID = [
  'Yang menarik, ',
  'Perlu dipahami bahwa ',
  'Patut diketahui, ',
  'Menariknya, ',
  'Jika diamati lebih cermat, ',
  'Dari sudut pandang ini, ',
  'Jika kita telusuri lebih jauh, ',
  'Hal yang sering luput dari perhatian adalah ',
  'Sejalan dengan itu, ',
  'Seiring berjalannya waktu, ',
];

const HUMAN_TRANSITIONS_EN = [
  'Interestingly, ',
  'As it turns out, ',
  'Looking closer, ',
  'What often goes unnoticed is that ',
  'In practice, ',
  'From a practical standpoint, ',
  'When we dig deeper, ',
  'As things currently stand, ',
  'Along these lines, ',
  'In the grand scheme of things, ',
];

// ---- HELPER FUNCTIONS ----

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function pickRandom<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

function isIndonesian(text: string): boolean {
  const idWords = ['yang', 'dan', 'dari', 'untuk', 'dengan', 'dalam', 'ini', 'itu', 'adalah', 'pada', 'ke', 'di', 'tidak', 'akan', 'telah', 'sudah', 'oleh', 'juga', 'atau', 'dapat', 'bisa', 'harus', 'bahwa', 'sebagai', 'serta', 'tersebut'];
  const words = text.toLowerCase().split(/\s+/);
  let count = 0;
  for (const w of words) {
    if (idWords.includes(w)) count++;
  }
  return count / Math.max(words.length, 1) > 0.05;
}

function splitSentences(text: string): string[] {
  // Split on sentence-ending punctuation but keep the punctuation
  const parts = text.split(/(?<=[.!?])\s+/);
  return parts.filter(s => s.trim().length > 0);
}

// ---- CORE HUMANIZATION FUNCTIONS ----

function replaceSynonyms(text: string, level: HumanizeLevel, rng: () => number): { text: string; changes: number } {
  let changes = 0;
  let result = text;
  const isId = isIndonesian(text);
  const map = isId ? SYNONYM_MAP : ENGLISH_SYNONYM_MAP;

  // Determine replacement probability based on level
  const prob = level === 'light' ? 0.25 : level === 'medium' ? 0.45 : 0.65;

  for (const [word, synonyms] of Object.entries(map)) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    result = result.replace(regex, (match) => {
      if (rng() < prob) {
        changes++;
        const syn = pickRandom(synonyms, rng);
        // Preserve case
        if (match[0] === match[0].toUpperCase()) {
          return syn.charAt(0).toUpperCase() + syn.slice(1);
        }
        return syn;
      }
      return match;
    });
  }

  return { text: result, changes };
}

function replaceAIPhrases(text: string, level: HumanizeLevel, rng: () => number): { text: string; changes: number } {
  let changes = 0;
  let result = text;
  const prob = level === 'light' ? 0.5 : level === 'medium' ? 0.75 : 0.95;

  for (const [pattern, replacements] of AI_PHRASE_REPLACEMENTS) {
    result = result.replace(pattern, (match) => {
      if (rng() < prob) {
        changes++;
        const replacement = pickRandom(replacements, rng);
        // Preserve leading capitalization
        if (match[0] === match[0].toUpperCase() && replacement[0] !== replacement[0].toUpperCase()) {
          return replacement.charAt(0).toUpperCase() + replacement.slice(1);
        }
        return replacement;
      }
      return match;
    });
  }

  return { text: result, changes };
}

function replaceAISentenceStarters(text: string, rng: () => number): { text: string; changes: number } {
  let changes = 0;
  let result = text;

  for (const [pattern, replacements] of AI_SENTENCE_STARTERS) {
    const sentences = result.split(/(?<=[.!?])\s+/);
    const newSentences = sentences.map(s => {
      const m = s.match(pattern);
      if (m) {
        changes++;
        const rep = pickRandom(replacements, rng);
        return s.replace(pattern, rep);
      }
      return s;
    });
    result = newSentences.join(' ');
  }

  return { text: result, changes };
}

function varySentenceLength(text: string, level: HumanizeLevel, rng: () => number): { text: string; changes: number } {
  if (level as string === 'light') return { text, changes: 0 };

  const sentences = splitSentences(text);
  if (sentences.length < 3) return { text, changes: 0 };

  let changes = 0;
  const result: string[] = [];

  for (let i = 0; i < sentences.length; i++) {
    const s = sentences[i].trim();
    const words = s.split(/\s+/);

    // Split very long sentences (> 35 words) at conjunctions
    if (words.length > 35 && level === 'heavy' && rng() > 0.4) {
      const conjunctions = ['yang', 'dan', 'serta', 'dimana', 'karena', 'sehingga', 'tetapi', 'namun',
        'and', 'but', 'because', 'which', 'where', 'while', 'although', 'since'];
      
      let splitIdx = -1;
      const midStart = Math.floor(words.length * 0.35);
      const midEnd = Math.floor(words.length * 0.65);
      
      for (let j = midStart; j < midEnd; j++) {
        if (conjunctions.includes(words[j].toLowerCase().replace(/,/g, ''))) {
          splitIdx = j;
          break;
        }
      }

      if (splitIdx > 0) {
        const firstPart = words.slice(0, splitIdx).join(' ');
        const secondPart = words.slice(splitIdx).join(' ');
        
        // Capitalize second part and ensure first ends with period
        const cleanFirst = firstPart.replace(/[,;]$/, '').trim() + '.';
        const cleanSecond = secondPart.charAt(0).toUpperCase() + secondPart.slice(1);
        
        result.push(cleanFirst, cleanSecond);
        changes++;
        continue;
      }
    }

    // Merge very short consecutive sentences (< 8 words)
    if (words.length < 8 && i + 1 < sentences.length) {
      const nextWords = sentences[i + 1].trim().split(/\s+/);
      if (nextWords.length < 8 && rng() > 0.5 && level !== 'light') {
        const isId = isIndonesian(text);
        const connector = isId
          ? pickRandom([' dan ', ' serta ', ', di mana ', ', selain itu '], rng)
          : pickRandom([' and ', ', plus ', ', while also ', ', and at the same time '], rng);
        
        const merged = s.replace(/[.!?]$/, '') + connector + sentences[i + 1].trim().charAt(0).toLowerCase() + sentences[i + 1].trim().slice(1);
        result.push(merged);
        i++; // skip next
        changes++;
        continue;
      }
    }

    result.push(s);
  }

  return { text: result.join(' '), changes };
}

function addHumanTouches(text: string, level: HumanizeLevel, rng: () => number): { text: string; changes: number } {
  if (level === 'light') return { text, changes: 0 };

  let changes = 0;
  const sentences = splitSentences(text);
  const isId = isIndonesian(text);
  const transitions = isId ? HUMAN_TRANSITIONS_ID : HUMAN_TRANSITIONS_EN;
  
  const result = sentences.map((s, idx) => {
    // Add natural transitions occasionally (every ~5-8 sentences)
    if (idx > 0 && idx % Math.floor(5 + rng() * 4) === 0 && rng() > 0.5) {
      const transition = pickRandom(transitions, rng);
      // Only add if sentence doesn't already start with a transition
      if (!s.match(/^(Menariknya|Yang menarik|Interestingly|As it turns out|Looking closer)/i)) {
        changes++;
        const lower = s.charAt(0).toLowerCase() + s.slice(1);
        return transition + lower;
      }
    }

    return s;
  });

  return { text: result.join(' '), changes };
}

function removeRepetitivePatterns(text: string, rng: () => number): { text: string; changes: number } {
  let changes = 0;
  let result = text;

  // Remove repeated "Hal ini" starts
  const sentences = result.split(/(?<=[.!?])\s+/);
  let halIniCount = 0;
  const isId = isIndonesian(text);

  const processed = sentences.map(s => {
    if (isId && /^Hal ini\b/i.test(s.trim())) {
      halIniCount++;
      if (halIniCount > 1) {
        const replacements = ['Ini', 'Kondisi ini', 'Fenomena ini', 'Fakta ini', 'Situasi ini', 'Kenyataan ini'];
        changes++;
        return s.replace(/^Hal ini/i, pickRandom(replacements, rng));
      }
    }
    if (!isId && /^This is\b/i.test(s.trim())) {
      halIniCount++;
      if (halIniCount > 1) {
        const replacements = ['That is', 'Such a thing is', 'The situation is', 'This particular case is'];
        changes++;
        return s.replace(/^This is/i, pickRandom(replacements, rng));
      }
    }
    return s;
  });

  result = processed.join(' ');

  // Remove excessive "sangat" / "very"
  let veryCount = 0;
  result = result.replace(/\b(sangat|very)\b/gi, (match) => {
    veryCount++;
    if (veryCount > 2 && rng() > 0.3) {
      changes++;
      const isIdWord = match.toLowerCase() === 'sangat';
      return isIdWord 
        ? pickRandom(['amat', 'begitu', 'sungguh', 'teramat', 'luar biasa'], rng)
        : pickRandom(['quite', 'rather', 'particularly', 'remarkably', 'exceptionally'], rng);
    }
    return match;
  });

  return { text: result, changes };
}

function restructureSentences(text: string, level: HumanizeLevel, rng: () => number): { text: string; changes: number } {
  if (level !== 'heavy') return { text, changes: 0 };

  let changes = 0;
  const sentences = splitSentences(text);
  const isId = isIndonesian(text);

  const result = sentences.map(s => {
    // Only restructure some sentences
    if (rng() > 0.2) return s;

    const trimmed = s.trim();

    if (isId) {
      // Move "Oleh karena itu, X" → "X, oleh karena itu"
      const olehMatch = trimmed.match(/^(Oleh karena itu|Dengan demikian|Maka dari itu),?\s+(.+)/i);
      if (olehMatch && rng() > 0.5) {
        changes++;
        const body = olehMatch[2].charAt(0).toUpperCase() + olehMatch[2].slice(1);
        return body.replace(/[.!?]$/, '') + ', ' + olehMatch[1].toLowerCase() + '.';
      }

      // "X sangat Y" → "Y yang X" sometimes
      // "Menurut Z, ..." → rephrase
      const menurutMatch = trimmed.match(/^Menurut\s+(.+?),\s+(.+)/i);
      if (menurutMatch && rng() > 0.5) {
        changes++;
        const body = menurutMatch[2].charAt(0).toUpperCase() + menurutMatch[2].slice(1);
        return body.replace(/[.!?]$/, '') + ' (sebagaimana dikemukakan oleh ' + menurutMatch[1] + ').';
      }
    } else {
      // "According to X, Y" → "Y (as X noted)"
      const accMatch = trimmed.match(/^According to\s+(.+?),\s+(.+)/i);
      if (accMatch && rng() > 0.5) {
        changes++;
        const body = accMatch[2].charAt(0).toUpperCase() + accMatch[2].slice(1);
        return body.replace(/[.!?]$/, '') + ' (as ' + accMatch[1] + ' noted).';
      }

      // "Therefore, X" → "X, therefore"
      const thereforeMatch = trimmed.match(/^(Therefore|Consequently|Thus|Hence),?\s+(.+)/i);
      if (thereforeMatch && rng() > 0.5) {
        changes++;
        const body = thereforeMatch[2].charAt(0).toUpperCase() + thereforeMatch[2].slice(1);
        return body.replace(/[.!?]$/, '') + ', ' + thereforeMatch[1].toLowerCase() + '.';
      }
    }

    return s;
  });

  return { text: result.join(' '), changes };
}

// ---- MAIN HUMANIZE FUNCTION ----

export function humanizeText(text: string, level: HumanizeLevel): HumanizeResult {
  if (!text.trim()) {
    return { text: '', changes: 0, originalWordCount: 0, newWordCount: 0, similarityEstimate: 100 };
  }

  const seed = text.length * 31 + text.charCodeAt(0) * 7 + (text.charCodeAt(Math.floor(text.length / 2)) || 0) * 13;
  const rng = seededRandom(seed);

  let totalChanges = 0;
  let result = text;

  // Step 1: Replace AI-specific phrases
  const step1 = replaceAIPhrases(result, level, rng);
  result = step1.text;
  totalChanges += step1.changes;

  // Step 2: Replace AI sentence starters
  const step2 = replaceAISentenceStarters(result, rng);
  result = step2.text;
  totalChanges += step2.changes;

  // Step 3: Replace synonyms
  const step3 = replaceSynonyms(result, level, rng);
  result = step3.text;
  totalChanges += step3.changes;

  // Step 4: Remove repetitive patterns
  const step4 = removeRepetitivePatterns(result, rng);
  result = step4.text;
  totalChanges += step4.changes;

  // Step 5: Vary sentence length
  const step5 = varySentenceLength(result, level, rng);
  result = step5.text;
  totalChanges += step5.changes;

  // Step 6: Restructure sentences (heavy only)
  const step6 = restructureSentences(result, level, rng);
  result = step6.text;
  totalChanges += step6.changes;

  // Step 7: Add human touches
  const step7 = addHumanTouches(result, level, rng);
  result = step7.text;
  totalChanges += step7.changes;

  // Clean up double spaces
  result = result.replace(/\s{2,}/g, ' ').trim();

  const originalWords = text.trim().split(/\s+/).length;
  const newWords = result.trim().split(/\s+/).length;

  // Estimate similarity (rough)
  const originalSet = new Set(text.toLowerCase().split(/\s+/));
  const newSet = new Set(result.toLowerCase().split(/\s+/));
  let common = 0;
  for (const w of newSet) {
    if (originalSet.has(w)) common++;
  }
  const _similarity = Math.round((common / Math.max(newSet.size, 1)) * 100);
  void _similarity;

  return {
    text: result,
    changes: totalChanges,
    originalWordCount: originalWords,
    newWordCount: newWords,
    similarityEstimate: Math.max(0, Math.min(100, 100 - Math.round((totalChanges / Math.max(originalWords, 1)) * 100 * 1.5))),
  };
}

// ---- HUMANIZE PER-LINE (preserves markdown structure) ----
export function humanizeWithStructure(text: string, level: HumanizeLevel): HumanizeResult {
  const lines = text.split('\n');
  let totalChanges = 0;
  let totalOrigWords = 0;
  let totalNewWords = 0;

  const resultLines = lines.map(line => {
    const trimmed = line.trim();

    // Skip empty lines, headings, list markers, code blocks, special markers
    if (!trimmed) return line;
    if (/^#{1,6}\s/.test(trimmed)) {
      // It's a heading — humanize the text part only
      const match = trimmed.match(/^(#{1,6}\s+)(.+)/);
      if (match) {
        const prefix = match[1];
        const content = match[2];
        const result = humanizeText(content, level);
        totalChanges += result.changes;
        totalOrigWords += result.originalWordCount;
        totalNewWords += result.newWordCount;
        return prefix + result.text;
      }
      return line;
    }
    if (/^[-*•]\s+/.test(trimmed)) {
      // Bullet list item — humanize content
      const match = trimmed.match(/^([-*•]\s+)(.+)/);
      if (match) {
        const prefix = match[1];
        const content = match[2];
        const result = humanizeText(content, level);
        totalChanges += result.changes;
        totalOrigWords += result.originalWordCount;
        totalNewWords += result.newWordCount;
        return prefix + result.text;
      }
      return line;
    }
    if (/^\d+[.)]\s+/.test(trimmed)) {
      // Numbered list — humanize content
      const match = trimmed.match(/^(\d+[.)]\s+)(.+)/);
      if (match) {
        const prefix = match[1];
        const content = match[2];
        const result = humanizeText(content, level);
        totalChanges += result.changes;
        totalOrigWords += result.originalWordCount;
        totalNewWords += result.newWordCount;
        return prefix + result.text;
      }
      return line;
    }
    if (/^>\s+/.test(trimmed)) {
      // Blockquote — humanize content
      const match = trimmed.match(/^(>\s+)(.+)/);
      if (match) {
        const prefix = match[1];
        const content = match[2];
        const result = humanizeText(content, level);
        totalChanges += result.changes;
        totalOrigWords += result.originalWordCount;
        totalNewWords += result.newWordCount;
        return prefix + result.text;
      }
      return line;
    }
    if (/^```/.test(trimmed) || /^\|/.test(trimmed)) {
      // Code block or table — skip
      return line;
    }
    if (/[.…·]{3,}/.test(trimmed)) {
      // TOC line — skip
      return line;
    }

    // Regular paragraph
    const result = humanizeText(trimmed, level);
    totalChanges += result.changes;
    totalOrigWords += result.originalWordCount;
    totalNewWords += result.newWordCount;
    return result.text;
  });

  const originalWords = text.trim().split(/\s+/).length;
  const finalText = resultLines.join('\n');
  const newWords = finalText.trim().split(/\s+/).length;

  return {
    text: finalText,
    changes: totalChanges,
    originalWordCount: originalWords,
    newWordCount: newWords,
    similarityEstimate: Math.max(0, Math.min(100, 100 - Math.round((totalChanges / Math.max(originalWords, 1)) * 100 * 1.2))),
  };
}
