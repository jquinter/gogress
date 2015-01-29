package main

import ( "fmt"
//"time"
//"sync"
"net/http"
//"html"
"database/sql"
_ "github.com/go-sql-driver/mysql"
//"encoding/json"
)
type Site struct {
  Name string `json:"name"`
  Description string `json:"page2"`
  URL string `json:"page"`
  Code string `json:"code"`
}
func main() {
  db,_:= sql.Open("mysql", "root:@/contenidos")
  fmt.Println("Ping()", db.Ping())
  //s := new(Site)
  /*var wg sync.WaitGroup
  c := make(chan int, 3)
  go func() { 
    for i:=0;i<100;i++ {
      wg.Add(1)
      fmt.Println(i, ">>")
      c <- i
    }
  }()
  go func() {
    for t := range c {
     fmt.Println("<<",t)
     wg.Done();
    }
  }()*/
  http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request){
    /*t := r.URL.Query();
    fmt.Println(t["q"])
    for _, a := range t["q"] {
      fmt.Println(a)
    }*/
    //enc := json.NewEncoder(w);
    //rows, _ := db.Query("select * from site")
    fmt.Fprintf(w, "[")
    /*if rows.Next() {
      rows.Scan(&s.Code, &s.Name, &s.Description, &s.URL)
      enc.Encode(&s)
      for rows.Next() {
        fmt.Fprintf(w, ",")
        rows.Scan(&s.Code, &s.Name, &s.Description, &s.URL)
        enc.Encode(&s)
      }
    }*/
    fmt.Fprintf(w, "]")
    //fmt.Fprintf(w, "Hello, %q", html.EscapeString(r.URL.Path))
  })
  //http.ListenAndServe(":8080", nil)
  //time.Sleep(10*time.Second)
  //wg.Wait()
}